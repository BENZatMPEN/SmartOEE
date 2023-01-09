import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { FaqAttachmentEntity } from './faq-attachment-entity';
import { Exclude } from 'class-transformer';
import { UserEntity } from './user-entity';

@Entity('faqs')
export class FaqEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 500 })
  topic: string;

  @Column({ type: 'datetime' })
  date: Date;

  @Column({ type: 'datetime' })
  startDate: Date;

  @Column({ type: 'datetime' })
  endDate: Date;

  @Column({ type: 'varchar', length: 500 })
  createdByUserEmail: string;

  @Column({ type: 'int', nullable: true })
  createdByUserId: number;

  @ManyToOne(() => UserEntity, { onDelete: 'SET NULL' })
  createdByUser: UserEntity;

  @Column({ type: 'varchar', length: 500 })
  approvedByUserEmail: string;

  @Column({ type: 'int', nullable: true })
  approvedByUserId: number;

  @ManyToOne(() => UserEntity, { onDelete: 'SET NULL' })
  approvedByUser: UserEntity;

  @Column({ type: 'longtext', nullable: true })
  description: string;

  @Column({ type: 'longtext', nullable: true })
  remark: string;

  @Exclude()
  @Column({ default: false })
  deleted: boolean;

  @Column({ type: 'int' })
  siteId: number;

  @Column({ type: 'varchar', length: 100 })
  status: string;

  @OneToMany(() => FaqAttachmentEntity, (faqAttachment) => faqAttachment.faq)
  attachments: FaqAttachmentEntity[];

  @Column({ type: 'datetime' })
  createdAt: Date;

  @Column({ type: 'datetime' })
  updatedAt: Date;
}
