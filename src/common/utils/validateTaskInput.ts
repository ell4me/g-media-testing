import { GqlError, HTTP_STATUS_CODES } from '../errors';

export const validateTaskInput = (title?: string | null, description?: string | null) => {
  if (title && !title?.trim()) {
    throw new GqlError('Title less than 1 characters', HTTP_STATUS_CODES.BAD_REQUEST);
  }

  if (title && title.trim().length > 100) {
    throw new GqlError('Title bigger than 100 characters', HTTP_STATUS_CODES.BAD_REQUEST);
  }

  if (description && description.trim().length > 500) {
    throw new GqlError('Description bigger than 500 characters', HTTP_STATUS_CODES.BAD_REQUEST);
  }
};
