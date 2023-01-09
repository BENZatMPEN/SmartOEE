import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('attachments')
export class AttachmentEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 500 })
  name: string;

  @Column({ type: 'varchar', length: 4000 })
  fileName: string;

  @Column({ type: 'int' })
  length: number;

  @Column({ type: 'varchar', length: 500 })
  mime: string;

  @Column({ type: 'datetime' })
  createdAt: Date;
}
