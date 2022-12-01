export class CreateOeeBatchDto {
  readonly startDate: Date;
  readonly endDate: Date;
  readonly plannedQuantity: number;
  readonly oeeId: number;
  readonly productId: number;
  readonly lotNumber: string;
}
