export type OeeBatchPlannedDowntime = {
  id: number;
  name: string;
  type: string;
  timing: string;
  seconds: number;
  expiredAt: Date;
  oeeBatchId: number;
  createdAt: Date;
  updatedAt: Date;
};
