export class FilterHistoryLogDto {
  readonly search: string;
  readonly order: string;
  readonly orderBy: string;
  readonly page: number;
  readonly rowsPerPage: number;
  readonly siteId: number;
  readonly type: string;
  readonly fromDate: Date;
  readonly toDate: Date;
}
