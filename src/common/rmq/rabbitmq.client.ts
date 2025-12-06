import amqp, { Channel, ChannelModel, ConsumeMessage } from 'amqplib';
import { FastifyBaseLogger } from 'fastify';

import { envConfig } from '../../config/env';

import { RMQ_INIT_ERROR_MESSAGE } from './constants';
import { MessageDto, RoutingKeys } from './types';

export class RabbitMqClient {
  private static instance: RabbitMqClient;
  private connection: ChannelModel | null = null;
  private channel: Channel | null = null;

  private constructor(private readonly logger: FastifyBaseLogger) {}

  public static getInstance(logger: FastifyBaseLogger): RabbitMqClient {
    if (!RabbitMqClient.instance) {
      RabbitMqClient.instance = new RabbitMqClient(logger);
    }
    return RabbitMqClient.instance;
  }

  public async connect(): Promise<Channel> {
    if (this.channel) {
      return this.channel;
    }

    this.connection = await amqp.connect(envConfig.rabbitMqUrl);
    this.channel = await this.connection.createChannel();

    await this.channel.assertExchange(envConfig.rabbitMqExchange, 'direct', {
      durable: true,
    });

    await this.channel.assertQueue(envConfig.rabbitMqQueue, {
      durable: true,
    });

    await this.channel.bindQueue(
      envConfig.rabbitMqQueue,
      envConfig.rabbitMqExchange,
      envConfig.rabbitMqRoutingKey,
    );

    return this.channel;
  }

  public async publish(routingKey: RoutingKeys, message: MessageDto): Promise<void> {
    if (!this.channel) {
      throw new Error(RMQ_INIT_ERROR_MESSAGE);
    }

    const buffer = Buffer.from(JSON.stringify(message));
    this.channel.publish(envConfig.rabbitMqExchange, routingKey, buffer, {
      contentType: 'application/json',
      persistent: true,
    });
  }

  public async consume(
    onMessage: (message: ConsumeMessage) => Promise<void> | void,
  ): Promise<void> {
    if (!this.channel) {
      throw new Error(RMQ_INIT_ERROR_MESSAGE);
    }

    await this.channel.consume(
      envConfig.rabbitMqQueue,
      async (message) => {
        if (!message) {
          return;
        }

        try {
          await onMessage(message);
          this.channel!.ack(message);
        } catch (e) {
          this.logger.error(e, 'RMQ task consumer failed');
          this.channel!.nack(message, false, true);
        }
      },
      { noAck: false },
    );
  }
}
