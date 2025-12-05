import { FastifyRequest, FastifyReply } from 'fastify';

import { TaskService } from '../modules/task/application/task.service';

export interface GraphQLContext {
  request: FastifyRequest;
  reply: FastifyReply;
  services: {
    taskService: TaskService;
  };
}

export function buildContext(
  request: FastifyRequest,
  reply: FastifyReply,
  services: { taskService: TaskService },
): GraphQLContext {
  return {
    request,
    reply,
    services,
  };
}
