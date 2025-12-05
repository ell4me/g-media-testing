import { FastifySchema } from 'fastify';

import { HTTP_STATUS_CODES } from '../../common/errors';

import { TaskStatus } from './task.model';

const taskStatusEnum = Object.values(TaskStatus);

const MAX_LENGTH_TITLE = 100;
const MAX_LENGTH_DESC = 100;

const taskResponseItemSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    title: { type: 'string' },
    description: { type: 'string', nullable: true },
    dueDate: { type: 'string', format: 'date-time' },
    status: { type: 'string' },
  },
  required: ['id', 'title', 'dueDate', 'status'],
};

const taskNotFoundSchema = {
  type: 'object',
  properties: {
    message: { type: 'string' },
    statusCode: { type: 'string' },
    timestamp: { type: 'string' },
    path: { type: 'string' },
  },
  required: ['message', 'statusCode', 'timestamp', 'path'],
};

export const taskParamsSchema: FastifySchema = {
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'string', minLength: 10 },
    },
  },
};

export const getTasksResponseSchema: FastifySchema = {
  response: {
    [HTTP_STATUS_CODES.OK]: {
      type: 'array',
      items: taskResponseItemSchema,
    },
  },
};

export const getTaskByIdResponseSchema: FastifySchema = {
  ...taskParamsSchema,
  response: {
    [HTTP_STATUS_CODES.OK]: taskResponseItemSchema,
    [HTTP_STATUS_CODES.NOT_FOUND]: taskNotFoundSchema,
  },
};

export const createTaskSchema: FastifySchema = {
  body: {
    type: 'object',
    required: ['title', 'dueDate'],
    additionalProperties: false,
    properties: {
      title: { type: 'string', minLength: 1, maxLength: MAX_LENGTH_TITLE },
      description: { type: 'string', maxLength: MAX_LENGTH_DESC },
      dueDate: { type: 'string', format: 'date-time' },
      status: { type: 'string', enum: taskStatusEnum },
    },
  },
  response: {
    [HTTP_STATUS_CODES.CREATED]: taskResponseItemSchema,
  },
};

export const updateTaskSchema: FastifySchema = {
  ...taskParamsSchema,
  body: {
    type: 'object',
    additionalProperties: false,
    properties: {
      title: { type: 'string', maxLength: MAX_LENGTH_TITLE },
      description: { type: 'string', maxLength: MAX_LENGTH_DESC },
      status: { type: 'string', enum: taskStatusEnum },
    },
  },
  response: {
    [HTTP_STATUS_CODES.NO_CONTENT]: {
      type: 'null',
    },
    [HTTP_STATUS_CODES.NOT_FOUND]: taskNotFoundSchema,
  },
};
