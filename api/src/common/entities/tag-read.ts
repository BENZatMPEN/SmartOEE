import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { Read } from '../type/read';
import { Site } from './site';

@Entity('tagReads')
export class TagRead {
  @PrimaryColumn({ type: 'int' })
  siteId: number;

  @ManyToOne(() => Site, { onDelete: 'CASCADE' })
  site: Site;

  @Column({ type: 'json' })
  read: Read;

  @Column({ type: 'datetime' })
  timestamp: Date;
}
