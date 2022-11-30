import { Device } from './device';

export type Site = {
  id: number;
  name: string;
  imageUrl: string;
  createdDate: Date;
  modifiedDate: Date;
  sync: boolean;
  deleted: boolean;
  devices: Device[];
};
