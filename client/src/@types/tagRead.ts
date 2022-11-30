export type ReadItem = {
  tagId: number;
  read: string;
};

export type TagRead = {
  siteId: number;
  deviceId: number;
  timestamp: Date;
  reads: ReadItem[];
};
