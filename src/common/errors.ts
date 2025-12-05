export class AppError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode: HTTP_STATUS_CODES) {
    super(message);
    this.statusCode = statusCode;
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
