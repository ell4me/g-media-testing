import { TaskDocument } from './task.model';
import { TaskRepository } from './task.repository';

export class TaskService {
  constructor(private readonly taskRepository: TaskRepository) {}

  public async getTasks(): Promise<TaskDocument[]> {
    return this.taskRepository.getTasks();
  }

  public async getTaskById(id: string): Promise<TaskDocument | null> {
    return this.taskRepository.getTaskById(id);
  }
}
