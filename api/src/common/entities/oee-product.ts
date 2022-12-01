import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Oee } from './oee';
import { Product } from './product';

@Entity('oeeProducts')
export class OeeProduct {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  oeeId: number;

  @ManyToOne(() => Oee, (oee) => oee.oeeProducts, { onDelete: 'CASCADE' })
  oee: Oee;

  @Column({ type: 'int' })
  productId: number;

  @ManyToOne(() => Product, (product) => product.oeeProducts, { onDelete: 'CASCADE' })
  product: Product;

  @Column({ type: 'double precision', default: 0 })
  standardSpeedSeconds: number;

  @Column({ type: 'datetime' })
  createdAt: Date;

  @Column({ type: 'datetime' })
  updatedAt: Date;
}
