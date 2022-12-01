export class ChartFilterDto {
  readonly type: string;
  readonly ids: string[];
  readonly duration: string;
  readonly viewType: string;
  readonly from: Date;
  readonly to: Date;
}
