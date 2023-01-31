import { Type } from 'class-transformer';
import { IsDate, IsNumber, IsOptional, IsString } from 'class-validator';

export class ImportResultPlanningDto {
  constructor(success: boolean, invalidRows?: number[]) {
    this.success = success;
    this.invalidRows = invalidRows;
  }

  readonly success: boolean;
  readonly invalidRows?: number[];
}
