import { FastifyRequest, FastifyReply } from 'fastify';

import { RabbitMqClient } from '../common/rmq/rabbitmq.client';
import { PublishRmqClient } from '../common/rmq/types';
import { TaskService } from '../modules/task/application/task.service';

export interface GraphQLContext {
  request: FastifyRequest;
  reply: FastifyReply;
  services: {
    taskService: TaskService;
    rmqClient: PublishRmqClient;
  };
}

export function buildContext(
  request: FastifyRequest,
  reply: FastifyReply,
  services: { taskService: TaskService; rmqClient: RabbitMqClient },
): GraphQLContext {
  return {
    request,
    reply,
    services,
  };
}
