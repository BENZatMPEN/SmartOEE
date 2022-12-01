import { Attachment } from './attachment';
import { Faq } from './faq';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('faqAttachments')
export class FaqAttachment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  faqId: number;

  @ManyToOne(() => Faq, (faq) => faq.attachments, { onDelete: 'CASCADE' })
  faq: Faq;

  @Column({ type: 'int' })
  attachmentId: number;

  @ManyToOne(() => Attachment)
  attachment: Attachment;

  @Column({ type: 'varchar', length: 500 })
  groupName: string;

  @Column({ type: 'datetime' })
  createdAt: Date;
}
