import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { SiteEntity } from './site.entity';
import { UserEntity } from './user.entity';

@Entity('historyLogs')
export class HistoryLogEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 200 })
  type: string;

  @Column({ type: 'json', nullable: true })
  data: any;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'int' })
  siteId: number;

  @ManyToOne(() => SiteEntity)
  site: SiteEntity;

  @Column({ type: 'int', nullable: true })
  userId: number;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  user: UserEntity;

  @Column({ type: 'datetime' })
  createdAt: Date;
}
