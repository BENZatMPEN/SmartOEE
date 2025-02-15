import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity('andonColumns')
@Unique(['siteId', 'columnOrder'])
export class AndonColumnEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  columnName: string;

  @Column({ unique: true })
  columnValue: string;

  @Column({ type: 'int' })
  columnOrder: number;

  @Column({ default: false })
  deleted: boolean;

  @Column({ type: 'int' })
  siteId: number;

  @Column({ type: 'datetime' })
  createdAt: Date;

  @Column({ type: 'datetime' })
  updatedAt: Date;
}
