import { GqlError, HTTP_STATUS_CODES } from '../../../common/errors';
import { sanitizeObjectDeep } from '../../../common/utils/sanitize';
import { validateTaskInput } from '../../../common/utils/validateTaskInput';
import { Resolvers } from '../../../graphql/__generated__/types';
import { TaskViewDto } from '../task.model';

export const taskResolvers: Resolvers = {
  Query: {
    getTasks: (_parent, args, context): Promise<TaskViewDto[]> => {
      return context.services.taskService.getTasks(args.status);
    },
    getTask: async (_parent, args, context): Promise<TaskViewDto | null> => {
      const task = await context.services.taskService.getTaskById(args.id);

      if (!task) {
        throw new GqlError('Task not found', HTTP_STATUS_CODES.NOT_FOUND);
      }

      return task;
    },
  },
  Mutation: {
    createTask: async (_parent, args, context): Promise<TaskViewDto> => {
      validateTaskInput(args.createTaskInput?.title, args.createTaskInput?.description);
      const input = sanitizeObjectDeep(args.createTaskInput!);

      const task = await context.services.taskService.createTask(input);
      await context.services.rmqClient.publish('task.action', {
        taskId: task.id,
        action: 'created',
        timestamp: new Date().toISOString(),
      });

      return task;
    },
    updateTask: async (_parent, args, context) => {
      validateTaskInput(args.updateTaskInput?.title, args.updateTaskInput?.description);

      const { taskService } = context.services;
      const input = sanitizeObjectDeep(args.updateTaskInput!);
      const taskId = input.id;

      const task = await taskService.updateTask(input, taskId);

      if (!task) {
        throw new GqlError('Task not found', HTTP_STATUS_CODES.NOT_FOUND);
      }

      await context.services.rmqClient.publish('task.action', {
        taskId,
        action: 'updated',
        timestamp: new Date().toISOString(),
      });

      return taskService.getTaskById(taskId);
    },
  },
};
