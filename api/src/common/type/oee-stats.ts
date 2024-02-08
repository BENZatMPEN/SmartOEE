export class OeeStats {
  readonly aPercent: number;
  readonly pPercent: number;
  readonly qPercent: number;
  readonly oeePercent: number;

  readonly runningSeconds: number;
  readonly loadingSeconds: number;
  readonly operatingSeconds: number;
  readonly plannedDowntimeSeconds: number;
  readonly machineSetupSeconds: number;

  readonly totalStopSeconds: number;

  readonly totalBreakdownCount: number;
  readonly totalBreakdownSeconds: number;

  readonly totalSpeedLossCount: number;
  readonly totalSpeedLossSeconds: number;
  readonly totalMinorStopCount: number;
  readonly totalMinorStopSeconds: number;

  readonly totalCount: number;
  readonly totalManualDefects: number;
  readonly totalAutoDefects: number;
  readonly totalOtherDefects: number;
  readonly totalManualGrams: number;

  readonly target: number;
  readonly efficiency: number;

  readonly pStopSeconds: number;
}

export const initialOeeBatchStats: OeeStats = {
  aPercent: 0,
  pPercent: 0,
  qPercent: 0,
  oeePercent: 0,
  runningSeconds: 0,
  loadingSeconds: 0,
  operatingSeconds: 0,
  plannedDowntimeSeconds: 0,
  machineSetupSeconds: 0,
  totalCount: 0,
  totalBreakdownCount: 0,
  totalBreakdownSeconds: 0,
  totalStopSeconds: 0,
  totalSpeedLossCount: 0,
  totalSpeedLossSeconds: 0,
  totalMinorStopCount: 0,
  totalMinorStopSeconds: 0,
  totalManualDefects: 0,
  totalManualGrams: 0,
  totalAutoDefects: 0,
  totalOtherDefects: 0,
  target: 0,
  efficiency: 0,
  pStopSeconds: 0,
};
