import sanitizeHtml, { IOptions } from 'sanitize-html';

export type SanitizedObject = Record<string, unknown>;

const defaultSanitizeOptions: IOptions = {
  allowedTags: [],
  allowedAttributes: {},
  disallowedTagsMode: 'discard',
};

export const sanitizeString = (value: unknown): string | null => {
  if (typeof value !== 'string') {
    return null;
  }

  const cleaned = sanitizeHtml(value, defaultSanitizeOptions).trim();

  return cleaned !== '' ? cleaned : null;
};

export const sanitizeObjectDeep = <T extends SanitizedObject>(obj: T): T => {
  const result: SanitizedObject = {};

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      result[key] = sanitizeString(value);
      continue;
    }

    if (Array.isArray(value)) {
      result[key] = value.map((item) => {
        if (typeof item === 'string') {
          return sanitizeString(item);
        }

        if (item && typeof item === 'object') {
          return sanitizeObjectDeep(item as SanitizedObject);
        }

        return item;
      });
      continue;
    }

    if (value && typeof value === 'object') {
      result[key] = sanitizeObjectDeep(value as SanitizedObject);
      continue;
    }

    result[key] = value;
  }

  return result as T;
};
