import { Exclude } from 'class-transformer';
import { Column, Entity, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { SiteEntity } from './site-entity';
import { RoleEntity } from './role-entity';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 500 })
  email: string;

  @Exclude()
  @Column({ default: false })
  emailConfirmed: boolean;

  @Exclude()
  @Column({ type: 'varchar', length: 500 })
  passwordHash: string;

  @Column({ type: 'varchar', length: 200 })
  firstName: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  lastName: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  nickname: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  phoneNumber: string;

  @Column({ type: 'varchar', length: 4000, nullable: true })
  imageName: string;

  @Column({ default: false })
  isAdmin: boolean;

  @Column({ type: 'datetime' })
  createdAt: Date;

  @Column({ type: 'datetime' })
  updatedAt: Date;

  @Column({ type: 'datetime', nullable: true })
  lastLoggedInAt: Date;

  // @Exclude()
  // @ManyToMany(() => Role)
  // @JoinTable({ name: 'userRoles' })
  // roles: Role[];

  // @Column({ type: 'int' })
  // @ManyToOne(() => RoleEntity)
  // roleId: number;

  // @Exclude()
  // @ManyToMany(() => SiteEntity, { onDelete: 'CASCADE' })
  // @JoinTable({ name: 'userSites' })
  // sites: SiteEntity[];

  // @OneToMany(() => UserSiteRole, (userSite) => userSite.user)
  // userSites: UserSiteRole[];

  // @Exclude()
  // @ManyToMany(() => Site)
  // @JoinColumn()
  // sites: Site[];

  // @Exclude()
  // @ManyToMany(() => Role)
  // @JoinTable({ name: 'userRoles' })
  // roles: Role[];
}
