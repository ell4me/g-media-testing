import { ApolloServer } from '@apollo/server';
import { fastifyApolloHandler } from '@as-integrations/fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import Fastify, { FastifyInstance } from 'fastify';

import { MongoDbClient } from './common/db/mongo.client';
import { HTTP_STATUS_CODES } from './common/errors';
import { RabbitMqClient } from './common/rmq/rabbitmq.client';
import { SanitizedObject, sanitizeObjectDeep } from './common/utils/sanitize';
import { buildContext, GraphQLContext } from './graphql/context';
import { buildSchema } from './graphql/schema';
import { TaskConsumer } from './modules/task/api/task.consumer';
import { taskController } from './modules/task/api/task.controller';
import { TaskService } from './modules/task/application/task.service';
import { TaskRepository } from './modules/task/infrastructure/task.repository';
import { TaskBase } from './modules/task/task.model';

export interface AppDeps {
  mongoClient: MongoDbClient;
  rmqClient: RabbitMqClient;
  taskService: TaskService;
}

export const buildApp = async (): Promise<FastifyInstance> => {
  const fastify = Fastify({
    logger: true,
    ignoreTrailingSlash: true,
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
  const rmqClient = RabbitMqClient.getInstance(fastify.log);

  await mongoClient.connect();
  await rmqClient.connect();

  const taskRepository = new TaskRepository(mongoClient.getCollection<TaskBase>('task'));
  const taskService = new TaskService(taskRepository);

  const deps: AppDeps = {
    mongoClient,
    taskService,
    rmqClient,
  };

  const taskConsumer = new TaskConsumer(deps.rmqClient, fastify.log);
  taskConsumer.start().catch((err) => fastify.log.error(err, 'Task consumer failed to start'));

  await fastify.register(taskController, {
    prefix: '/api',
    taskService: deps.taskService,
    rmqClient: deps.rmqClient,
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
          rmqClient: deps.rmqClient,
        }),
    }),
  });

  fastify.get('/health', () => ({ status: 'ok' }));
  fastify.delete('/testing', async (_request, reply) => {
    await mongoClient.getCollection('task').deleteMany();
    return reply.status(HTTP_STATUS_CODES.NO_CONTENT).send();
  });

  return fastify;
};
