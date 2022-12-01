export class CreateProblemSolutionTaskDto {
  title: string;
  assigneeUserId: number;
  startDate: Date;
  endDate: Date;
  comment: string;
  status: string;
  problemSolutionId: number;
}
