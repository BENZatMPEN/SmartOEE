export class UpdatePlannedDowntimeDto {
  readonly id: number;
  readonly name: string;
  readonly type: string;
  readonly timing: string;
  readonly seconds: number;
  readonly siteId: number;
}
