import { FastifyInstance, FastifyPluginOptions } from 'fastify';

import { TaskService } from './task.service';
import { ROUTES } from '../../routes';

export interface TaskRoutesDeps {
  taskService: TaskService;
}

export const taskController = async (
  fastify: FastifyInstance,
  opts: FastifyPluginOptions & TaskRoutesDeps,
) => {
  const { taskService } = opts;

  fastify.get(ROUTES.TASKS, async (_request, reply) => {
    const tasks = await taskService.getTasks();
    return reply.send(tasks);
  });
};
