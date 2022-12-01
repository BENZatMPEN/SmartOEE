export class UpdateProblemSolutionTaskDto {
  id: number;
  title: string;
  assigneeUserId: number;
  startDate: Date;
  endDate: Date;
  comment: string;
  status: string;
  problemSolutionId: number;
}
