export const initialAnalyticData: AnalyticData = {
  standardSpeedSeconds: 0,
  runningSeconds: 0,
  plannedDowntimeSeconds: 0,
  machineSetupSeconds: 0,
  totalCount: 0,
  totalBreakdownSeconds: 0,
  totalStopSeconds: 0,
  totalSpeedLossSeconds: 0,
  totalMinorStopSeconds: 0,
  totalManualDefects: 0,
  totalAutoDefects: 0,
  totalOtherDefects: 0,
};

export class AnalyticData {
  readonly standardSpeedSeconds: number;
  readonly runningSeconds: number;
  readonly plannedDowntimeSeconds: number;
  readonly machineSetupSeconds: number;
  readonly totalStopSeconds: number;
  readonly totalBreakdownSeconds: number;
  readonly totalSpeedLossSeconds: number;
  readonly totalMinorStopSeconds: number;
  readonly totalCount: number;
  readonly totalManualDefects: number;
  readonly totalAutoDefects: number;
  readonly totalOtherDefects: number;
}

export type AnalyticAParam = {
  seconds: number;
  tagId: number;
  machineId: number;
  machineParameterId: number;
};

export type AnalyticPParam = {
  seconds: number;
  tagId: number;
  machineId: number;
  machineParameterId: number;
};

export type AnalyticQParam = {
  autoAmount: number;
  manualAmount: number;
  tagId: number;
  machineId: number;
  machineParameterId: number;
};
