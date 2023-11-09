import { ProblemSolutionEntity } from './problem-solution.entity';
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ProblemSolutionTaskAttachmentEntity } from './problem-solution-task-attachment.entity';
import { UserEntity } from './user.entity';

@Entity('problemSolutionTasks')
export class ProblemSolutionTaskEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 500 })
  title: string;

  @Column({ type: 'int', nullable: true })
  assigneeUserId: number;

  @ManyToOne(() => UserEntity, { onDelete: 'SET NULL' })
  assigneeUser: UserEntity;

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

  @ManyToOne(() => ProblemSolutionEntity, (problemSolution) => problemSolution.tasks, { onDelete: 'CASCADE' })
  problemSolution: ProblemSolutionEntity;

  @OneToMany(() => ProblemSolutionTaskAttachmentEntity, (attachment) => attachment.problemSolutionTask)
  attachments: ProblemSolutionTaskAttachmentEntity[];

  @Column({ type: 'datetime' })
  createdAt: Date;

  @Column({ type: 'datetime' })
  updatedAt: Date;

  @Column({ type: 'int', default: 0 })
  order: number;
}
