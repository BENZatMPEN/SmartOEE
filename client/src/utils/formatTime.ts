import dayjs from 'dayjs';

export function fShortDate(date: Date | string | number): string {
  return dayjs(new Date(date)).format('D MMM YY');
}

export function fDate(date: Date | string | number): string {
  return dayjs(new Date(date)).format('DD/MM/YYYY');
}

export function fDateTime(date: Date | string | number): string {
  return dayjs(new Date(date)).format('DD MMM YYYY HH:mm');
}

export function fShortDateTime(date: Date | string | number): string {
  return dayjs(new Date(date)).format('DD/MM/YYYY HH:mm');
}

export function fTime(date: Date | string | number): string {
  return dayjs(new Date(date)).format('HH:mm:ss');
}

export function fTimeShort(date: Date | string | number): string {
  return dayjs(new Date(date)).format('HH:mm');
}

export function fTimestamp(date: Date | string | number): number {
  return dayjs(new Date(date)).millisecond();
}

export function fDateTimeSuffix(date: Date | string | number) {
  return dayjs(new Date(date)).format('DD/MM/YYYY HH:mm');
}

export function fToNow(date: Date | string | number) {
  return dayjs(new Date(date)).fromNow();
}
