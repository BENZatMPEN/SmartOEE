import { AttachmentEntity } from './attachment-entity';
import { FaqEntity } from './faq-entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('faqAttachments')
export class FaqAttachmentEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  faqId: number;

  @ManyToOne(() => FaqEntity, (faq) => faq.attachments, { onDelete: 'CASCADE' })
  faq: FaqEntity;

  @Column({ type: 'int' })
  attachmentId: number;

  @ManyToOne(() => AttachmentEntity, { onDelete: 'CASCADE' })
  attachment: AttachmentEntity;

  @Column({ type: 'varchar', length: 500 })
  groupName: string;

  @Column({ type: 'datetime' })
  createdAt: Date;
}
