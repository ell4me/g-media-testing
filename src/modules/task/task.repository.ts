import { Collection, ObjectId } from 'mongodb';
import { TaskDocument } from './task.model';
import { AppError } from '../../common/errors';

export class TaskRepository {
  constructor(private readonly collectionTasks: Collection<TaskDocument>) {}

  public async getTasks(): Promise<TaskDocument[]> {
    return this.collectionTasks.find({}).toArray();
  }

  public async getTaskById(id: string): Promise<TaskDocument | null> {
    if (!ObjectId.isValid(id)) {
      throw new AppError('Invalid task id', 400);
    }
    return this.collectionTasks.findOne({ _id: new ObjectId(id) });
  }
}
