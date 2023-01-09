import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { UserEntity } from '../common/entities/user-entity';
import { FilterUserDto } from './dto/filter-user.dto';
import { PagedLisDto } from '../common/dto/paged-list.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { RoleEntity } from '../common/entities/role-entity';
import { SiteEntity } from '../common/entities/site-entity';
import { UserSiteRoleEntity } from '../common/entities/user-site-role-entity';
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
    @InjectRepository(UserSiteRoleEntity)
    private userRoleRepository: Repository<UserSiteRoleEntity>,
  ) {}

  async findPagedList(filterDto: FilterUserDto): Promise<PagedLisDto<UserEntity>> {
    const offset = filterDto.page == 0 ? 0 : filterDto.page * filterDto.rowsPerPage;
    const [rows, count] = await this.userRepository
      .createQueryBuilder()
      .where(':search is null or firstName like :search or lastName like :search or email like :search')
      .orderBy(`${filterDto.orderBy}`, filterDto.order === 'asc' ? 'ASC' : 'DESC')
      .skip(offset)
      .take(filterDto.rowsPerPage)
      .setParameters({ search: filterDto.search ? `%${filterDto.search}%` : null })
      .getManyAndCount();

    return { list: rows, count: count };
  }

  findAll(): Promise<UserEntity[]> {
    return this.userRepository.find();
  }

  async findById(id: number): Promise<UserEntity> {
    return this.userRepository.findOneOrFail({ where: { id } });
  }

  async findByEmail(email: string): Promise<UserEntity> {
    return this.userRepository.findOneBy({ email });
  }

  async findRolesByIdAndSiteId(id: number, siteId: number): Promise<RoleEntity> {
    const userRole = await this.userRoleRepository.findOneBy({ userId: id, siteId });
    return userRole?.role;
  }

  async create(createDto: CreateUserDto, imageName: string, siteId: number): Promise<UserEntity> {
    // if (siteId) {
    //   const site = await this.siteRepository.findOneBy({ id: siteId });
    //   const countUser = await this.userRepository.countBy({ siteId: site.id });
    //   if (site.oeeLimit > -1 && countUser >= site.userLimit) {
    //     throw new BadRequestException(`Number of users has reached the limit (${site.oeeLimit})`);
    //   }
    // }

    const { password, ...dto } = createDto;
    const saltOrRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltOrRounds);

    const user = await this.userRepository.save({
      ...dto,
      passwordHash,
      imageName,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // if (siteId) {
    //   const site = await this.siteRepository.findOneBy({ id: siteId });
    //   user.sites = [site];
    // }

    return this.userRepository.save(user);
  }

  async update(id: number, updateDto: UpdateUserDto, imageName: string, siteId: number): Promise<UserEntity> {
    const updatingUser = await this.userRepository.findOneBy({ id });
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

  async delete(id: number): Promise<void> {
    await this.userRepository.delete(id);
  }

  async deleteMany(ids: number[]): Promise<void> {
    await this.userRepository.delete(ids);
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
