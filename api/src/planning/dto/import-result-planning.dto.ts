import { ImportPlanningDto } from './import-planning.dto';
import { ImportErrorRowPlanningDto } from './import-error-row-planning.dto';

export class ImportResultPlanningDto {
  constructor(success: boolean, invalidRows?: ImportErrorRowPlanningDto[]) {
    this.success = success;
    this.invalidRows = invalidRows;
  }

  readonly success: boolean;
  readonly invalidRows?: ImportErrorRowPlanningDto[];
}
