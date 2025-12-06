import { WithId } from 'mongodb';

import { Nullable } from '../../common/types';

export interface TaskParamId {
  id: string;
}

export interface TaskParamStatus {
  status?: TaskStatus;
}

export enum TaskStatus {
  InProgress = 'IN_PROGRESS',
  Open = 'OPEN',
  Closed = 'CLOSED',
  Expired = 'EXPIRED',
}

export interface TaskBase {
  title: string;
  description?: string | null;
  dueDate: Date;
  status: TaskStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type TaskDocument = WithId<TaskBase>;

export interface TaskViewDto {
  id: string;
  title: string;
  description?: string | null;
  dueDate: string;
  status: TaskStatus;
}

export interface CreateTaskDto {
  title: string;
  description?: string | null;
  dueDate: string;
  status?: TaskStatus | null;
}

export type UpdateTaskBase = Partial<{
  title: string;
  description: string | null;
  status: TaskStatus;
}>;

export type UpdateTaskDto = Nullable<UpdateTaskBase>;
