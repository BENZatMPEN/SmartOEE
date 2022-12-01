import { Attachment } from './attachment';
import { ProblemSolution } from './problem-solution';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('problemSolutionAttachments')
export class ProblemSolutionAttachment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  problemSolutionId: number;

  @ManyToOne(() => ProblemSolution, (problemSolution) => problemSolution.attachments, {
    onDelete: 'CASCADE',
  })
  problemSolution: ProblemSolution;

  @Column({ type: 'int' })
  attachmentId: number;

  @ManyToOne(() => Attachment)
  attachment: Attachment;

  @Column({ type: 'varchar', length: 500 })
  groupName: string;

  @Column({ type: 'datetime' })
  createdAt: Date;
}
