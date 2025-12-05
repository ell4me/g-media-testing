import { mapTaskToViewDto } from '../../../common/utils/mapTaskToViewDto';
import { TaskRepository } from '../infrastructure/task.repository';
import { CreateTaskDto, TaskStatus, TaskViewDto, UpdateTaskDto } from '../task.model';

export class TaskService {
  constructor(private readonly taskRepository: TaskRepository) {}

  public async getTasks(status?: TaskStatus | null): Promise<TaskViewDto[]> {
    const tasks = await this.taskRepository.getTasks(status);
    return tasks.map(mapTaskToViewDto);
  }

  public async getTaskById(id: string): Promise<TaskViewDto | null> {
    const task = await this.taskRepository.getTaskById(id);

    if (task) {
      return mapTaskToViewDto(task);
    }

    return task;
  }

  public async createTask(createTaskDto: CreateTaskDto): Promise<TaskViewDto> {
    const task = await this.taskRepository.createTask(createTaskDto);
    return mapTaskToViewDto(task);
  }

  public async updateTask(updateTaskDto: UpdateTaskDto, taskId: string): Promise<boolean> {
    const task = await this.taskRepository.getTaskById(taskId);

    if (!task) {
      return false;
    }

    return this.taskRepository.updateTask(updateTaskDto, taskId);
  }
}
