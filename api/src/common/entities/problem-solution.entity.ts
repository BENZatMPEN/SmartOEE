import { ProblemSolutionTaskEntity } from './problem-solution-task.entity';
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ProblemSolutionAttachmentEntity } from './problem-solution-attachment.entity';
import { Exclude } from 'class-transformer';
import { OeeEntity } from './oee.entity';
import { UserEntity } from './user.entity';

@Entity('problemSolutions')
export class ProblemSolutionEntity {
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

  @ManyToOne(() => UserEntity, { onDelete: 'SET NULL' })
  headProjectUser: UserEntity;

  @Column({ type: 'int', nullable: true })
  approvedByUserId: number;

  @ManyToOne(() => UserEntity, { onDelete: 'SET NULL' })
  approvedByUser: UserEntity;

  @Column({ type: 'longtext', nullable: true })
  remark: string;

  @Exclude()
  @Column({ default: false })
  deleted: boolean;

  @Column({ type: 'int', nullable: true })
  oeeId: number;

  @ManyToOne(() => OeeEntity, { onDelete: 'SET NULL' })
  oee: OeeEntity;

  @Column({ type: 'int' })
  siteId: number;

  @Column({ type: 'varchar', length: 100 })
  status: string;

  @OneToMany(() => ProblemSolutionAttachmentEntity, (attachment) => attachment.problemSolution)
  attachments: ProblemSolutionAttachmentEntity[];

  @OneToMany(() => ProblemSolutionTaskEntity, (task) => task.problemSolution)
  tasks: ProblemSolutionTaskEntity[];

  @Column({ type: 'datetime' })
  createdAt: Date;

  @Column({ type: 'datetime' })
  updatedAt: Date;
}
