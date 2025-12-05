import { FastifyInstance, FastifyPluginOptions, FastifyRequest } from 'fastify';

import { TaskService } from './task.service';
import { ROUTES } from '../../routes';
import { CreateTaskDto, TaskParams, UpdateTaskDto } from './task.model';
import { AppError, HTTP_STATUS_CODES } from '../../common/errors';
import {
  createTaskSchema,
  getTaskByIdResponseSchema,
  getTasksResponseSchema,
  updateTaskSchema,
} from './task.validation-schema';

export interface TaskRoutesDeps {
  taskService: TaskService;
}

export const taskController = async (
  fastify: FastifyInstance,
  opts: FastifyPluginOptions & TaskRoutesDeps,
) => {
  const { taskService } = opts;

  fastify.get(ROUTES.TASKS, { schema: getTasksResponseSchema }, async (_request, reply) => {
    const tasks = await taskService.getTasks();
    return reply.send(tasks);
  });

  fastify.get(
    `${ROUTES.TASKS}/:id`,
    { schema: getTaskByIdResponseSchema },
    async (request: FastifyRequest<{ Params: TaskParams }>, reply) => {
      const task = await taskService.getTaskById(request.params.id);

      if (!task) {
        throw new AppError('Task not found', HTTP_STATUS_CODES.NOT_FOUND);
      }

      return reply.send(task);
    },
  );

  fastify.post(
    ROUTES.TASKS,
    { schema: createTaskSchema },
    async (request: FastifyRequest<{ Body: CreateTaskDto }>, reply) => {
      const task = await taskService.createTask(request.body);
      return reply.status(HTTP_STATUS_CODES.CREATED).send(task);
    },
  );

  fastify.patch(
    `${ROUTES.TASKS}/:id`,
    { schema: updateTaskSchema },
    async (request: FastifyRequest<{ Params: TaskParams; Body: UpdateTaskDto }>, reply) => {
      const task = await taskService.updateTask(request.body, request.params.id);

      if (!task) {
        throw new AppError('Task not found', HTTP_STATUS_CODES.NOT_FOUND);
      }

      return reply.status(HTTP_STATUS_CODES.NO_CONTENT).send();
    },
  );
};
