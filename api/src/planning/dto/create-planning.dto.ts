export class CreatePlanningDto {
  readonly title: string;
  readonly lotNumber: string;
  readonly color: string;
  readonly startDate: Date;
  readonly endDate: Date;
  readonly plannedQuantity: number;
  readonly remark: string;
  readonly allDay: boolean;
  readonly productId: number;
  readonly oeeId: number;
  readonly siteId: number;
  readonly userId: number;
}
