import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Exclude } from 'class-transformer';
import { SiteEntity } from './site.entity';
import { OeeEntity } from './oee.entity';
import { UserEntity } from './user.entity';
import { ProductEntity } from './product.entity';
import { EndType, StartType } from '../enums/batchTypes';

@Entity('plannings')
export class PlanningEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 500 })
  title: string;

  @Column({ type: 'varchar', length: 2000, default: '' })
  lotNumber: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  color: string;

  @Column({ type: 'datetime' })
  startDate: Date;

  @Column({ type: 'datetime' })
  endDate: Date;

  @Column({ type: 'int', default: 0 })
  plannedQuantity: number;

  @Column({ type: 'longtext', nullable: true })
  remark: string;

  @Column({ type: 'int' })
  productId: number;

  @ManyToOne(() => ProductEntity, { onDelete: 'CASCADE' })
  product: ProductEntity;

  @Column({ type: 'int' })
  oeeId: number;

  @ManyToOne(() => OeeEntity, { onDelete: 'CASCADE' })
  oee: OeeEntity;

  @Exclude()
  @Column({ default: false })
  deleted: boolean;

  @Column({ type: 'int' })
  siteId: number;

  @ManyToOne(() => SiteEntity)
  site: SiteEntity;

  @Column({ type: 'int', nullable: true })
  userId: number;

  @ManyToOne(() => UserEntity, { onDelete: 'SET NULL' })
  user: UserEntity;

  @Column({ type: 'datetime' })
  createdAt: Date;

  @Column({ type: 'datetime' })
  updatedAt: Date;

  @Column({ type: 'enum', enum: StartType, nullable: true })
  startType: StartType;

  @Column({ type: 'enum', enum: EndType, nullable: true })
  endType: EndType;

  @Column({ type: 'int' })
  operatorId: number;
}
