import { ObjectId } from 'mongodb';

enum TaskStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  CLOSED = 'closed',
  EXPIRED = 'expired',
}

export interface TaskDocument {
  _id: ObjectId;
  title: string;
  description?: string;
  dueDate: Date;
  status: TaskStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskViewDto {
  id: string;
  title: string;
  description?: string;
  dueDate: Date;
  status: TaskStatus;
}

export interface CreateTaskDto {
  title: string;
  description?: string;
  dueDate: string;
  status?: TaskStatus;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  status?: TaskStatus;
}
