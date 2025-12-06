import { MessageTask } from '../../modules/task/task.model';

import { RabbitMqClient } from './rabbitmq.client';

export type RoutingKeys = 'task.action';
export type MessageDto = MessageTask;
export type PublishRmqClient = Pick<RabbitMqClient, 'publish'>;
export type ConsumeRmqClient = Pick<RabbitMqClient, 'consume'>;
