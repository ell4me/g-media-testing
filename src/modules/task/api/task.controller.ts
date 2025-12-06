import { FastifyInstance, FastifyPluginOptions, FastifyRequest } from 'fastify';

import { AppError, HTTP_STATUS_CODES } from '../../../common/errors';
import { PublishRmqClient } from '../../../common/rmq/types';
import { ROUTES } from '../../../routes';
import { TaskService } from '../application/task.service';
import { CreateTaskDto, TaskParamId, TaskParamStatus, UpdateTaskDto } from '../task.model';

import {
  createTaskSchema,
  getTaskByIdResponseSchema,
  getTasksResponseSchema,
  updateTaskSchema,
} from './task.validation-schema';

export interface TaskRoutesDeps {
  taskService: TaskService;
  rmqClient: PublishRmqClient;
}

export const taskController = async (
  fastify: FastifyInstance,
  opts: FastifyPluginOptions & TaskRoutesDeps,
) => {
  const { taskService, rmqClient } = opts;

  fastify.get(
    ROUTES.TASKS,
    { schema: getTasksResponseSchema },
    async (request: FastifyRequest<{ Querystring: TaskParamStatus }>, reply) => {
      const tasks = await taskService.getTasks(request.query.status);
      return reply.send(tasks);
    },
  );

  fastify.get(
    `${ROUTES.TASKS}/:id`,
    { schema: getTaskByIdResponseSchema },
    async (request: FastifyRequest<{ Params: TaskParamId }>, reply) => {
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

      await rmqClient.publish('task.action', {
        taskId: task.id,
        action: 'created',
        timestamp: new Date().toISOString(),
      });

      return reply.status(HTTP_STATUS_CODES.CREATED).send(task);
    },
  );

  fastify.patch(
    `${ROUTES.TASKS}/:id`,
    { schema: updateTaskSchema },
    async (request: FastifyRequest<{ Params: TaskParamId; Body: UpdateTaskDto }>, reply) => {
      const task = await taskService.updateTask(request.body, request.params.id);

      if (!task) {
        throw new AppError('Task not found', HTTP_STATUS_CODES.NOT_FOUND);
      }

      await rmqClient.publish('task.action', {
        taskId: request.params.id,
        action: 'updated',
        timestamp: new Date().toISOString(),
      });

      return reply.status(HTTP_STATUS_CODES.NO_CONTENT).send();
    },
  );
};
