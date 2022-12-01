import { ProblemSolutionTaskDto } from './problem-solution-task.dto';

export class CreateProblemSolutionDto {
  readonly name: string;
  readonly date: Date;
  readonly startDate: Date;
  readonly endDate: Date;
  readonly headProjectUserId: number;
  readonly approveByUserId: number;
  readonly oeeId: number;
  readonly remark: string;
  readonly siteId: number;
  readonly status: string;
  readonly tasks: ProblemSolutionTaskDto[];
}
