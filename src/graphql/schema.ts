import { makeExecutableSchema } from '@graphql-tools/schema';
import { GraphQLSchema } from 'graphql';
import { readFileSync } from 'fs';
import { join } from 'path';

import { taskResolvers } from '../modules/task/task.resolvers';

const typeDefs = readFileSync(join(__dirname, 'schema.graphql'), 'utf8');

export function buildSchema(): GraphQLSchema {
  return makeExecutableSchema({
    typeDefs,
    resolvers: [taskResolvers],
  });
}
