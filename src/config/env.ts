import dotenv from 'dotenv';

dotenv.config();

export class EnvConfig {
  public readonly port: number;
  public readonly mongoUri: string;
  public readonly mongoDbName: string;
  public readonly rabbitMqUrl: string;
  public readonly rabbitMqExchange: string;
  public readonly rabbitMqQueue: string;
  public readonly rabbitMqRoutingKey: string;

  constructor() {
    this.port = Number(process.env.PORT ?? 4000);
    this.mongoUri = process.env.MONGO_URI ?? 'mongodb://localhost:27017';
    this.mongoDbName = process.env.MONGO_DB_NAME ?? 'task_db';
    this.rabbitMqUrl = process.env.RABBITMQ_URL ?? 'amqp://localhost:5672';
    this.rabbitMqExchange = process.env.RABBITMQ_EXCHANGE ?? 'task.exchange';
    this.rabbitMqQueue = process.env.RABBITMQ_QUEUE ?? ' task.actions';
    this.rabbitMqRoutingKey = process.env.RABBITMQ_ROUTING_KEY ?? 'task.action';
  }
}

export const envConfig = new EnvConfig();
