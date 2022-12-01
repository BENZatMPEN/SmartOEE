import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Exclude } from 'class-transformer';
import { Site } from './site';
import { Oee } from './oee';
import { User } from './user';
import { Product } from './product';

@Entity('plannings')
export class Planning {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 500 })
  title: string;

  @Column({ type: 'varchar', length: 2000, default: '' })
  lotNumber: string;

  @Column({ type: 'varchar', length: 50 })
  color: string;

  @Column({ type: 'datetime' })
  startDate: Date;

  @Column({ type: 'datetime' })
  endDate: Date;

  @Column({ type: 'int', default: 0 })
  plannedQuantity: number;

  @Column({ type: 'longtext', nullable: true })
  remark: string;

  @Column({ default: false })
  allDay: boolean;

  @Column({ type: 'int' })
  productId: number;

  @ManyToOne(() => Product)
  product: Product;

  @Column({ type: 'int' })
  oeeId: number;

  @ManyToOne(() => Oee, { onDelete: 'CASCADE' })
  oee: Oee;

  @Exclude()
  @Column({ default: false })
  deleted: boolean;

  @Column({ type: 'int' })
  siteId: number;

  @ManyToOne(() => Site)
  site: Site;

  @Column({ type: 'int' })
  userId: number;

  @ManyToOne(() => User)
  user: User;

  @Column({ type: 'datetime' })
  createdAt: Date;

  @Column({ type: 'datetime' })
  updatedAt: Date;
}
