import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { OeeEntity } from './oee-entity';
import { ProductEntity } from './product-entity';

@Entity('oeeProducts')
export class OeeProductEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  oeeId: number;

  @ManyToOne(() => OeeEntity, (oee) => oee.oeeProducts, { onDelete: 'CASCADE' })
  oee: OeeEntity;

  @Column({ type: 'int' })
  productId: number;

  @ManyToOne(() => ProductEntity, (product) => product.oeeProducts, { onDelete: 'CASCADE' })
  product: ProductEntity;

  @Column({ type: 'double precision', default: 0 })
  standardSpeedSeconds: number;

  @Column({ type: 'datetime' })
  createdAt: Date;

  @Column({ type: 'datetime' })
  updatedAt: Date;
}
