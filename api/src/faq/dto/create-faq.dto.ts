export class CreateFaqDto {
  readonly topic: string;
  readonly date: Date;
  readonly startDate: Date;
  readonly endDate: Date;
  readonly createdByUserId: number;
  readonly approvedByUserId: number;
  readonly description: string;
  readonly remark: string;
  readonly siteId: number;
  readonly status: string;
}
