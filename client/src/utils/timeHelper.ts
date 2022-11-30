import { TIME_UNIT_MINUTE, TIME_UNIT_SECOND } from '../constants';

export function convertMinuteToSecond(n: number) {
  return n * 60;
}

export function convertSecondToMinute(n: number) {
  return n / 60;
}

export function convertToUnit(n: number, timeUnit: string): number {
  switch (timeUnit) {
    case TIME_UNIT_SECOND:
      return n;

    case TIME_UNIT_MINUTE:
      return n / 60;

    default:
      return n;
  }
}
