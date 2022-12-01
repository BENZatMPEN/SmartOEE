export class CreatePlannedDowntimeDto {
  readonly name: string;
  readonly type: string;
  readonly timing: string;
  readonly seconds: number;
  readonly siteId: number;
}
