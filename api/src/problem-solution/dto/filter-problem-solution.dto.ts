export class FilterProblemSolutionDto {
  readonly search: string;
  readonly order: string;
  readonly orderBy: string;
  readonly page: number;
  readonly rowsPerPage: number;
  readonly siteId: number;
}
