export class OeeBatchPlannedDowntimeDto {
  readonly name: string;
  readonly type: string;
  readonly timing: string;
  readonly minutes: number;
  readonly oeeBatchId: number;
}
