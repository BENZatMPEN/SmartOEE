import { ProblemSolutionTask } from './problem-solution-task';
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ProblemSolutionAttachment } from './problem-solution-attachment';
import { Exclude } from 'class-transformer';
import { Oee } from './oee';
import { User } from './user';

@Entity('problemSolutions')
export class ProblemSolution {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 500 })
  name: string;

  @Column({ type: 'datetime' })
  date: Date;

  @Column({ type: 'datetime' })
  startDate: Date;

  @Column({ type: 'datetime' })
  endDate: Date;

  @Column({ type: 'int', nullable: true })
  headProjectUserId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  headProjectUser: User;

  @Column({ type: 'int', nullable: true })
  approvedByUserId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  approvedByUser: User;

  @Column({ type: 'longtext', nullable: true })
  remark: string;

  @Exclude()
  @Column({ default: false })
  deleted: boolean;

  @Column({ type: 'int', nullable: true })
  oeeId: number;

  @ManyToOne(() => Oee, { onDelete: 'CASCADE' })
  oee: Oee;

  @Column({ type: 'int' })
  siteId: number;

  @Column({ type: 'varchar', length: 100 })
  status: string;

  @OneToMany(() => ProblemSolutionAttachment, (attachment) => attachment.problemSolution)
  attachments: ProblemSolutionAttachment[];

  @OneToMany(() => ProblemSolutionTask, (task) => task.problemSolution)
  tasks: ProblemSolutionTask[];

  @Column({ type: 'datetime' })
  createdAt: Date;

  @Column({ type: 'datetime' })
  updatedAt: Date;
}
