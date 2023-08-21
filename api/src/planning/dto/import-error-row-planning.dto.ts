import { ImportPlanningDto } from './import-planning.dto';

export class ImportErrorRowPlanningDto {
  constructor(row: number, data: ImportPlanningDto, reason: string) {
    this.row = row;
    this.data = data;
    this.reason = reason;
  }

  readonly row: number;
  readonly data: ImportPlanningDto;
  readonly reason: string;
}
