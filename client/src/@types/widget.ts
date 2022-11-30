import { DeviceTag } from './device';

export type Widget = {
  id: number;
  type: string;
  data: any | null;
  deviceId: number | null;
  tagId: number | null;
  tag: DeviceTag;
  createdAt: Date;
  updatedAt: Date;
};
