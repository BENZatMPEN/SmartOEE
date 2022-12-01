import { ProblemSolution } from './problem-solution';
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ProblemSolutionTaskAttachment } from './problem-solution-task-attachment';
import { User } from './user';

@Entity('problemSolutionTasks')
export class ProblemSolutionTask {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 500 })
  title: string;

  @Column({ type: 'int', nullable: true })
  assigneeUserId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  assigneeUser: User;

  @Column({ type: 'datetime' })
  startDate: Date;

  @Column({ type: 'datetime' })
  endDate: Date;

  @Column({ type: 'longtext', nullable: true })
  comment: string;

  @Column({ type: 'varchar', length: 100 })
  status: string;

  @Column({ type: 'int' })
  problemSolutionId: number;

  @ManyToOne(() => ProblemSolution, (problemSolution) => problemSolution.tasks, { onDelete: 'CASCADE' })
  problemSolution: ProblemSolution;

  @OneToMany(() => ProblemSolutionTaskAttachment, (attachment) => attachment.problemSolutionTask)
  attachments: ProblemSolutionTaskAttachment[];

  @Column({ type: 'datetime' })
  createdAt: Date;

  @Column({ type: 'datetime' })
  updatedAt: Date;
}
