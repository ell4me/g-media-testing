import { ConsumeMessage } from 'amqplib';
import { FastifyBaseLogger } from 'fastify';

import { ConsumeRmqClient } from '../../../common/rmq/types';
import { MessageTask } from '../task.model';

export class TaskConsumer {
  constructor(
    private readonly rabbitMqClient: ConsumeRmqClient,
    private readonly logger: FastifyBaseLogger,
  ) {}

  public async start(): Promise<void> {
    await this.rabbitMqClient.consume(this.handleMessage.bind(this));
  }

  private async handleMessage(message: ConsumeMessage): Promise<void> {
    const raw = message.content.toString();

    try {
      const { taskId, timestamp, action }: MessageTask = JSON.parse(raw);
      this.logger.info(`Task ${taskId} was ${action} at ${timestamp}`);
    } catch (error) {
      this.logger.error({ error, raw }, 'Failed to parse rmq message');
    }
  }
}
