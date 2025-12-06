import { Collection, Filter, ObjectId } from 'mongodb';

import { AppError, HTTP_STATUS_CODES } from '../../../common/errors';
import {
  CreateTaskDto,
  TaskBase,
  TaskDocument,
  TaskStatus,
  UpdateTaskBase,
  UpdateTaskDto,
} from '../task.model';

export class TaskRepository {
  constructor(private readonly collectionTasks: Collection<TaskBase>) {}

  public async getTasks(status?: TaskStatus | null): Promise<TaskDocument[]> {
    const filter: Filter<TaskDocument> = {};

    if (status) {
      filter.status = status;
    }

    return this.collectionTasks.find(filter).toArray();
  }

  public async getTaskById(id: string): Promise<TaskDocument | null> {
    if (!ObjectId.isValid(id)) {
      throw new AppError('Invalid task id', HTTP_STATUS_CODES.BAD_REQUEST);
    }

    return this.collectionTasks.findOne({ _id: new ObjectId(id) });
  }

  public async createTask({
    status,
    title,
    dueDate,
    description,
  }: CreateTaskDto): Promise<TaskDocument> {
    const now = new Date();
    const doc: Omit<TaskDocument, '_id'> = {
      status: status ?? TaskStatus.Open,
      title,
      dueDate: new Date(dueDate),
      description,
      createdAt: now,
      updatedAt: now,
    };

    const { insertedId } = await this.collectionTasks.insertOne(doc);
    return {
      _id: insertedId,
      ...doc,
    };
  }

  public async updateTask(
    { description, title, status }: UpdateTaskDto,
    taskId: string,
  ): Promise<boolean> {
    const updateDto: UpdateTaskBase = { description };

    if (title) {
      updateDto.title = title;
    }

    if (status) {
      updateDto.status = status;
    }

    await this.collectionTasks.updateOne(
      { _id: new ObjectId(taskId) },
      { $set: { ...updateDto, updatedAt: new Date() } },
    );

    return true;
  }
}
