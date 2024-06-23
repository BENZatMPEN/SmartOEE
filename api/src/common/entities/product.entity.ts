import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Exclude } from 'class-transformer';
import { OeeProductEntity } from './oee-product.entity';

@Entity('products')
export class ProductEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 200 })
  sku: string;

  @Column({ type: 'varchar', length: 500 })
  name: string;

  @Column({ type: 'longtext', nullable: true })
  remark: string;

  @Column({ type: 'varchar', length: 4000, nullable: true })
  imageName: string;

  @Exclude()
  @Column({ default: false })
  deleted: boolean;

  @Column({ type: 'int' })
  siteId: number;

  @Column({ type: 'datetime' })
  createdAt: Date;

  @Column({ type: 'datetime' })
  updatedAt: Date;

  @OneToMany(() => OeeProductEntity, (oeeProduct) => oeeProduct.product)
  oeeProducts: OeeProductEntity[];

  @Column({ type: 'boolean', default: false })
  activePcs: boolean;

  @Column({ type: 'int', nullable: true })
  pscGram: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  secondUnit: string;
}
