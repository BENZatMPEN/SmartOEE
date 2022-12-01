import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { User } from '../common/entities/user';
import { FilterUserDto } from './dto/filter-user.dto';
import { PagedLisDto } from '../common/dto/paged-list.dto';
import { ContentService } from '../common/content/content.service';
import * as _ from 'lodash';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { Role } from '../common/entities/role';
import { Site } from '../common/entities/site';
import { UserRole } from '../common/entities/user-role';

@Injectable()
export class UserService {
  constructor(
    private readonly contentService: ContentService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Site)
    private siteRepository: Repository<Site>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(UserRole)
    private userRoleRepository: Repository<UserRole>,
  ) {}

  async findPagedList(filterDto: FilterUserDto): Promise<PagedLisDto<User>> {
    const offset = filterDto.page == 0 ? 0 : filterDto.page * filterDto.rowsPerPage;
    const [rows, count] = await this.userRepository
      .createQueryBuilder()
      .where('deleted = false')
      .andWhere(':search is null or firstName like :search or lastName like :search or email like :search')
      .orderBy(`${filterDto.orderBy}`, filterDto.order === 'asc' ? 'ASC' : 'DESC')
      .skip(offset)
      .take(filterDto.rowsPerPage)
      .setParameters({ search: filterDto.search ? `%${filterDto.search}%` : null })
      .getManyAndCount();

    return { list: rows, count: count };
  }

  findAll(): Promise<User[]> {
    return this.userRepository.find({ where: { deleted: false } });
  }

  async findById(id): Promise<User> {
    return this.userRepository.findOne({ where: { id, deleted: false } });
  }

  async findRolesByIdAndSiteId(id: number, siteId: number): Promise<Role> {
    const userRole = await this.userRoleRepository.findOneBy({ userId: id, siteId });
    return userRole?.role;
  }

  async create(createDto: CreateUserDto): Promise<User> {
    const { password, siteId, roleIds, ...dto } = createDto;
    const saltOrRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltOrRounds);

    const user = await this.userRepository.save({
      ...dto,
      passwordHash,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // if (roleIds) {
    //   user.roles = await this.roleRepository.findBy({ id: In(roleIds) });
    // }

    if (siteId) {
      const site = await this.siteRepository.findOneBy({ id: siteId });
      user.sites = [site];
    }

    return this.userRepository.save(user);
  }

  async update(id: number, updateDto: UpdateUserDto): Promise<User> {
    const updatingUser = await this.userRepository.findOneBy({ id });
    return this.userRepository.save({
      ..._.assign(updatingUser, updateDto),
      updatedAt: new Date(),
    });
  }

  async upload(id: number, image: Express.Multer.File): Promise<User> {
    const user = await this.userRepository.findOneBy({ id });
    if (image) {
      user.imageUrl = await this.contentService.saveUserImage(user.id.toString(), image.buffer, image.mimetype);
      await this.userRepository.save(user);
    }

    return user;
  }

  async delete(id: number): Promise<void> {
    const user = await this.userRepository.findOneBy({ id });
    user.deleted = true;
    user.updatedAt = new Date();
    await this.userRepository.save(user);
  }

  async deleteMany(ids: number[]): Promise<void> {
    const users = await this.userRepository.findBy({ id: In(ids) });
    await this.userRepository.save(
      users.map((user) => {
        user.deleted = true;
        user.updatedAt = new Date();
        return user;
      }),
    );
  }

  // async findAll(): Promise<User[]> {
  //   // const user1 = await this.usersRepository.findOne({ where: { id: 1 } });
  //   // const user2 = await this.usersRepository.findOne({ where: { id: 2 } });
  //   //
  //   // const ability1 = this.caslAbilityFactory.createForUser(user1);
  //   // if (ability1.can(Action.Read, 'all')) {
  //   //   // "user" has read access to everything
  //   //   console.log('user1 Read');
  //   // }
  //   //
  //   // if (ability1.can(Action.Manage, 'all')) {
  //   //   // "user" has read access to everything
  //   //   console.log('user1 Manage');
  //   // }
  //   //
  //   // const ability2 = this.caslAbilityFactory.createForUser(user2);
  //   // if (ability2.can(Action.Read, 'all')) {
  //   //   // "user" has read access to everything
  //   //   console.log('user2 Read');
  //   // }
  //   //
  //   // if (ability2.can(Action.Manage, 'all')) {
  //   //   // "user" has read access to everything
  //   //   console.log('user2 Manage');
  //   // }
  //
  //   return this.usersRepository.find();
  //   // const users = await this.userRepository.findAll({ where: { deleted: false } });
  //   // // const dtos = users.map((user) => plainToInstance(UserDto, user.get({ plain: true })));
  //   // return users.map((user) => user.get({ plain: true })); //this.userRepository.findAll({ where: { deleted: false } });
  // }
}
