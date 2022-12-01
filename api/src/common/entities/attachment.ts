import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { FaqAttachment } from './faq-attachment';

@Entity('attachments')
export class Attachment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 500 })
  name: string;

  @Column({ type: 'varchar', length: 4000 })
  url: string;

  @Column({ type: 'int' })
  length: number;

  @Column({ type: 'varchar', length: 500 })
  mime: string;

  @Column({ type: 'datetime' })
  createdAt: Date;
}
