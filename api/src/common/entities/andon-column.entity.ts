import { Entity, Unique, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('andonColumns')
@Unique(['siteId', 'columnOrder'])
export class AndonColumnEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  columnName: string;

  @Column()
  columnValue: string;

  @Column({ type: 'int' })
  columnOrder: number;

  @Column({ default: false })
  deleted: boolean;

  @Column({ type: 'int' })
  siteId: number;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
