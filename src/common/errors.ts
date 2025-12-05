import { GraphQLError } from 'graphql/error';

export class AppError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode: HTTP_STATUS_CODES) {
    super(message);
    this.statusCode = statusCode;
  }
}

export class GqlError extends GraphQLError {
  constructor(message: string, status: HTTP_STATUS_CODES) {
    super(message, {
      extensions: {
        code: HTTP_STATUS_CODES[status],
      },
    });
  }
}

export enum HTTP_STATUS_CODES {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  NOT_FOUND = 404,
  BAD_REQUEST = 400,
  INTERNAL_SERVER = 500,
}
