import { AttachmentEntity } from './attachment.entity';
import { ProblemSolutionTaskEntity } from './problem-solution-task.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('problemSolutionTaskAttachments')
export class ProblemSolutionTaskAttachmentEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  problemSolutionTaskId: number;

  @ManyToOne(() => ProblemSolutionTaskEntity, (problemSolutionTask) => problemSolutionTask.attachments, {
    onDelete: 'CASCADE',
  })
  problemSolutionTask: ProblemSolutionTaskEntity;

  @Column({ type: 'int' })
  attachmentId: number;

  @ManyToOne(() => AttachmentEntity, { onDelete: 'CASCADE' })
  attachment: AttachmentEntity;

  @Column({ type: 'varchar', length: 500 })
  groupName: string;

  @Column({ type: 'datetime' })
  createdAt: Date;
}
