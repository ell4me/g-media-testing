import { TaskDocument, TaskViewDto } from '../../modules/task/task.model';

export const transformTaskToViewDto = ({
  _id,
  dueDate,
  description,
  status,
  title,
}: TaskDocument): TaskViewDto => ({
  id: _id.toString(),
  status,
  dueDate,
  description,
  title,
});
