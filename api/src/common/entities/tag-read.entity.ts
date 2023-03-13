import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { Read } from '../type/read';
import { SiteEntity } from './site.entity';

@Entity('tagReads')
export class TagReadEntity {
  @PrimaryColumn({ type: 'int' })
  siteId: number;

  @ManyToOne(() => SiteEntity, { onDelete: 'CASCADE' })
  site: SiteEntity;

  @Column({ type: 'json' })
  read: Read;

  @Column({ type: 'datetime' })
  timestamp: Date;
}
