import { DeviceTag } from './device';

export type Widget = {
  id: number | null;
  type: string;
  data: any | null;
  deviceId: number | null;
  tagId: number | null;
  tag: DeviceTag;
  createdAt: Date;
  updatedAt: Date;
};
