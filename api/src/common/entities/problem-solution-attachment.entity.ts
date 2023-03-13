import { AttachmentEntity } from './attachment.entity';
import { ProblemSolutionEntity } from './problem-solution.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('problemSolutionAttachments')
export class ProblemSolutionAttachmentEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  problemSolutionId: number;

  @ManyToOne(() => ProblemSolutionEntity, (problemSolution) => problemSolution.attachments, {
    onDelete: 'CASCADE',
  })
  problemSolution: ProblemSolutionEntity;

  @Column({ type: 'int' })
  attachmentId: number;

  @ManyToOne(() => AttachmentEntity, { onDelete: 'CASCADE' })
  attachment: AttachmentEntity;

  @Column({ type: 'varchar', length: 500 })
  groupName: string;

  @Column({ type: 'datetime' })
  createdAt: Date;
}
