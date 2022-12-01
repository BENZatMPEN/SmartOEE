import { Attachment } from './attachment';
import { ProblemSolutionTask } from './problem-solution-task';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('problemSolutionTaskAttachments')
export class ProblemSolutionTaskAttachment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  problemSolutionTaskId: number;

  @ManyToOne(() => ProblemSolutionTask, (problemSolutionTask) => problemSolutionTask.attachments, {
    onDelete: 'CASCADE',
  })
  problemSolutionTask: ProblemSolutionTask;

  @Column({ type: 'int' })
  attachmentId: number;

  @ManyToOne(() => Attachment)
  attachment: Attachment;

  @Column({ type: 'varchar', length: 500 })
  groupName: string;

  @Column({ type: 'datetime' })
  createdAt: Date;
}
