import { TaskDocument, TaskViewDto } from '../../modules/task/task.model';

export const mapTaskToViewDto = ({
  _id,
  dueDate,
  description,
  status,
  title,
}: TaskDocument): TaskViewDto => ({
  id: _id.toString(),
  status,
  dueDate: dueDate.toISOString(),
  description,
  title,
});
