import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import { fastifyApolloHandler } from '@as-integrations/fastify';
import { ApolloServer } from '@apollo/server';

import { MongoDbClient } from './db/mongo.client';
import { buildSchema } from './graphql/schema';
import { buildContext, GraphQLContext } from './graphql/context';
import { TaskService } from './modules/task/task.service';
import { taskController } from './modules/task/task.controller';
import { TaskBase } from './modules/task/task.model';
import { TaskRepository } from './modules/task/task.repository';
import { HTTP_STATUS_CODES } from './common/errors';
import { SanitizedObject, sanitizeObjectDeep } from './common/utils/sanitize';

export interface AppDeps {
  mongoClient: MongoDbClient;
  taskService: TaskService;
}

export const buildApp = async (): Promise<FastifyInstance> => {
  const fastify = Fastify({
    logger: true,
  });

  await fastify.register(cors, {
    origin: true,
  });

  await fastify.register(helmet, {
    contentSecurityPolicy: false,
  });

  fastify.addHook('preValidation', async (request, _reply) => {
    if (request.body && typeof request.body === 'object') {
      request.body = sanitizeObjectDeep(request.body as SanitizedObject);
    }
  });

  fastify.setErrorHandler((error, request, reply) => {
    if (error?.validation) {
      return reply.status(HTTP_STATUS_CODES.BAD_REQUEST).send({
        statusCode: HTTP_STATUS_CODES.BAD_REQUEST,
        timestamp: new Date().toISOString(),
        path: request.url,
        message: error.message,
      });
    }

    return reply.status(error.statusCode ?? HTTP_STATUS_CODES.INTERNAL_SERVER).send({
      statusCode: error.statusCode ?? HTTP_STATUS_CODES.INTERNAL_SERVER,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: error.message,
    });
  });

  const mongoClient = MongoDbClient.getInstance();
  await mongoClient.connect();

  const taskRepository = new TaskRepository(mongoClient.getCollection<TaskBase>('task'));
  const taskService = new TaskService(taskRepository);

  const deps: AppDeps = {
    mongoClient,
    taskService,
  };

  await fastify.register(taskController, {
    prefix: '/api',
    taskService: deps.taskService,
  });

  const schema = buildSchema();
  const apollo = new ApolloServer<GraphQLContext>({
    schema,
  });

  await apollo.start();

  fastify.route({
    url: '/graphql',
    method: ['GET', 'POST', 'OPTIONS'],
    handler: fastifyApolloHandler<GraphQLContext>(apollo, {
      context: async (request, reply) =>
        buildContext(request, reply, {
          taskService: deps.taskService,
        }),
    }),
  });
  fastify.get('/health', () => ({ status: 'ok' }));

  return fastify;
};
