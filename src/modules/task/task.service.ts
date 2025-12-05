import { CreateTaskDto, TaskViewDto, UpdateTaskDto } from './task.model';
import { TaskRepository } from './task.repository';
import { transformTaskToViewDto } from '../../common/utils/transformTaskToViewDto';

export class TaskService {
  constructor(private readonly taskRepository: TaskRepository) {}

  public async getTasks(): Promise<TaskViewDto[]> {
    const tasks = await this.taskRepository.getTasks();
    return tasks.map(transformTaskToViewDto);
  }

  public async getTaskById(id: string): Promise<TaskViewDto | null> {
    const task = await this.taskRepository.getTaskById(id);

    if (task) {
      return transformTaskToViewDto(task);
    }

    return task;
  }

  public async createTask(createTaskDto: CreateTaskDto): Promise<TaskViewDto> {
    const task = await this.taskRepository.createTask(createTaskDto);
    return transformTaskToViewDto(task);
  }

  public async updateTask(updateTaskDto: UpdateTaskDto, taskId: string): Promise<boolean> {
    const task = await this.taskRepository.getTaskById(taskId);

    if (!task) {
      return false;
    }

    return this.taskRepository.updateTask(updateTaskDto, taskId);
  }
}
