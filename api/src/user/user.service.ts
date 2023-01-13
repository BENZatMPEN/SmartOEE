import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../common/entities/user-entity';
import { FilterUserDto } from './dto/filter-user.dto';
import { PagedLisDto } from '../common/dto/paged-list.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { RoleEntity } from '../common/entities/role-entity';
import { SiteEntity } from '../common/entities/site-entity';
import { FileService } from '../common/services/file.service';

@Injectable()
export class UserService {
  constructor(
    private readonly fileService: FileService,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(SiteEntity)
    private siteRepository: Repository<SiteEntity>,
    @InjectRepository(RoleEntity)
    private roleRepository: Repository<RoleEntity>,
  ) {}

  private readonly saltOrRounds = 10;

  async findPagedList(filterDto: FilterUserDto, siteId: number): Promise<PagedLisDto<UserEntity>> {
    const offset = filterDto.page == 0 ? 0 : filterDto.page * filterDto.rowsPerPage;
    const query = this.userRepository.createQueryBuilder('u');

    console.log(siteId);
    if (siteId) {
      query.innerJoin('u.sites', 'us', 'us.id = :siteId', { siteId });
    } else {
      query.leftJoinAndSelect('u.sites', 'us');
    }

    const [rows, count] = await query
      .where(':search is null or u.firstName like :search or u.lastName like :search or u.email like :search')
      .orderBy(`u.${filterDto.orderBy}`, filterDto.order === 'asc' ? 'ASC' : 'DESC')
      .skip(offset)
      .take(filterDto.rowsPerPage)
      .setParameters({ search: filterDto.search ? `%${filterDto.search}%` : null })
      .getManyAndCount();

    // console.log(rows);

    return { list: rows, count: count };
  }

  findAll(siteId: number): Promise<UserEntity[]> {
    const query = this.userRepository.createQueryBuilder('u');

    if (siteId) {
      query.innerJoinAndSelect('u.sites', 'us', ':siteId is null or us.id = :siteId', { siteId });
    }

    return this.userRepository
      .createQueryBuilder('u')
      .innerJoinAndSelect('u.sites', 'us', ':siteId is null or us.id = :siteId', { siteId })
      .getMany();
  }

  findById(id: number, siteId: number): Promise<UserEntity> {
    return this.userRepository
      .createQueryBuilder('u')
      .innerJoinAndSelect('u.sites', 'us', ':siteId is null or us.id = :siteId', { siteId })
      .where('id = :id', { id })
      .getOne();
  }

  findByEmail(email: string): Promise<UserEntity> {
    return this.userRepository.findOneBy({ email });
  }

  // async findRolesByIdAndSiteId(id: number, siteId: number): Promise<RoleEntity> {
  //   const userRole = await this.userRoleRepository.findOneBy({ userId: id, siteId });
  //   return userRole?.role;
  // }

  async create(createDto: CreateUserDto, imageName: string, siteId: number): Promise<UserEntity> {
    if (siteId) {
      const site = await this.siteRepository.findOneBy({ id: siteId });
      const countUser = await this.userRepository
        .createQueryBuilder('u')
        .innerJoinAndSelect('u.sites', 'us', 'us.id = :siteId', { siteId })
        .getCount();
      if (site.userLimit > -1 && countUser >= site.userLimit) {
        throw new BadRequestException(`Number of users has reached the limit (${site.userLimit})`);
      }
    }

    const { password, ...dto } = createDto;
    const passwordHash = await bcrypt.hash(password, this.saltOrRounds);

    const user = await this.userRepository.save({
      ...dto,
      passwordHash,
      imageName,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    if (siteId) {
      const site = await this.siteRepository.findOneBy({ id: siteId });
      user.sites = [site];
    }

    return this.userRepository.save(user);
  }

  async update(id: number, updateDto: UpdateUserDto, imageName: string, siteId: number): Promise<UserEntity> {
    const updatingUser = await this.findById(id, siteId);
    const { imageName: existingImageName } = updatingUser;
    if (imageName && existingImageName) {
      await this.fileService.deleteFile(existingImageName);
    }

    return this.userRepository.save({
      ...updatingUser,
      ...updateDto,
      imageName: !imageName ? existingImageName : imageName,
      updatedAt: new Date(),
    });
  }

  async delete(id: number, siteId: number): Promise<void> {
    await this.userRepository
      .createQueryBuilder('u')
      .innerJoin('u.sites', 'us', ':siteId is null or us.id = :siteId', { siteId })
      .delete()
      .where('id = :id', { id })
      .execute();
  }

  async deleteMany(ids: number[], siteId: number): Promise<void> {
    await this.userRepository.delete(ids);

    await this.userRepository
      .createQueryBuilder('u')
      .innerJoin('u.sites', 'us', ':siteId is null or us.id = :siteId', { siteId })
      .delete()
      .where('id in (:ids)', { ids })
      .execute();
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
