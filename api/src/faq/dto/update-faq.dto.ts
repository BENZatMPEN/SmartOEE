export class UpdateFaqDto {
  readonly id: number;
  readonly topic: string;
  readonly date: Date;
  readonly startDate: Date;
  readonly endDate: Date;
  readonly createdByUserId: number;
  readonly approvedByUserId: number;
  readonly description: string;
  readonly remark: string;
  readonly siteId: string;
  readonly status: string;
}
