import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { FaqAttachment } from './faq-attachment';
import { Exclude } from 'class-transformer';
import { User } from './user';

@Entity('faqs')
export class Faq {
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

  @Column({ type: 'int', nullable: true })
  createdByUserId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  createdByUser: User;

  @Column({ type: 'int', nullable: true })
  approvedByUserId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  approvedByUser: User;

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

  @OneToMany(() => FaqAttachment, (faqAttachment) => faqAttachment.faq)
  attachments: FaqAttachment[];

  @Column({ type: 'datetime' })
  createdAt: Date;

  @Column({ type: 'datetime' })
  updatedAt: Date;
}
