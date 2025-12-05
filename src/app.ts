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
import { TaskDocument } from './modules/task/task.model';
import { TaskRepository } from './modules/task/task.repository';

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

  const mongoClient = MongoDbClient.getInstance();
  await mongoClient.connect();

  const taskRepository = new TaskRepository(mongoClient.getCollection<TaskDocument>('task'));
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
