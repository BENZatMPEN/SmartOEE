import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { UserEntity } from '../common/entities/user.entity';
import { FilterUserDto } from './dto/filter-user.dto';
import { PagedLisDto } from '../common/dto/paged-list.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { RoleEntity } from '../common/entities/role.entity';
import { SiteEntity } from '../common/entities/site.entity';
import { FileService } from '../common/services/file.service';
import { ChangePasswordDto } from './dto/change-password.dto';

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

  async findPagedList(filterDto: FilterUserDto): Promise<PagedLisDto<UserEntity>> {
    const offset = filterDto.page == 0 ? 0 : filterDto.page * filterDto.rowsPerPage;
    const [rows, count] = await this.userRepository
      .createQueryBuilder('u')
      .innerJoin('u.sites', 'us', 'us.id = :siteId', { siteId: filterDto.siteId })
      .where('(:search is null or u.firstName like :search or u.lastName like :search or u.email like :search)', {
        search: filterDto.search ? `%${filterDto.search}%` : null,
      })
      .orderBy(`u.${filterDto.orderBy}`, filterDto.order === 'asc' ? 'ASC' : 'DESC')
      .skip(offset)
      .take(filterDto.rowsPerPage)
      .getManyAndCount();

    return { list: rows, count: count };
  }

  findByOee(oeeId: number): Promise<UserEntity[]> {
    return this.userRepository
      .createQueryBuilder('u')
      .innerJoin('u.oees', 'o', 'o.id = :oeeId', { oeeId })
      .getMany();
  }

  async findOptions(siteId: number): Promise<any> {
    const list = await this.userRepository
      .createQueryBuilder('u')
      .innerJoin('u.sites', 'us', 'us.id = :siteId', { siteId })
      .getMany();

    return list.map((item) => {
      return {
        id: item.id,
        name: `${item.firstName} ${item.lastName}`,
      };
    });
  }

  findAll(siteId: number): Promise<UserEntity[]> {
    return this.userRepository
      .createQueryBuilder('u')
      .innerJoin('u.sites', 'us', 'us.id = :siteId', { siteId })
      .getMany();
  }

  findByIdAndSiteId(id: number, siteId: number): Promise<UserEntity> {
    return this.userRepository
      .createQueryBuilder('u')
      .leftJoinAndSelect('u.sites', 'us')
      .leftJoinAndSelect('u.roles', 'ur', 'ur.siteId = :siteId', { siteId })
      .where('u.id = :id', { id })
      .getOne();
  }

  findById(id: number): Promise<UserEntity> {
    return this.userRepository
      .createQueryBuilder('u')
      .leftJoinAndSelect('u.sites', 'us')
      .where('u.id = :id', { id })
      .getOne();
  }

  findByEmail(email: string): Promise<UserEntity> {
    return this.userRepository.findOneBy({ email });
  }

  async create(createDto: CreateUserDto, imageName: string, siteId: number): Promise<UserEntity> {
    if (siteId) {
      const site = await this.siteRepository.findOneBy({ id: siteId });
      const countUser = await this.userRepository
        .createQueryBuilder('u')
        .innerJoin('u.sites', 'us', 'us.id = :siteId', { siteId })
        .getCount();
      if (site.userLimit > -1 && countUser >= site.userLimit) {
        throw new BadRequestException(`Number of users has reached the limit (${site.userLimit})`);
      }
    }

    const { password, siteIds, ...dto } = createDto;
    const passwordHash = await bcrypt.hash(password, this.saltOrRounds);
    const roles = await this.roleRepository.findBy({ id: In([createDto.roleId]), siteId });
    const sites =
      siteIds && siteIds.length > 0
        ? {
          sites: await this.siteRepository.findBy({ id: In(siteIds) }),
        }
        : { sites: [] };

    return await this.userRepository.save({
      ...dto,
      ...sites,
      roles,
      passwordHash,
      imageName,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  async update(id: number, updateDto: UpdateUserDto, imageName: string, siteId: number): Promise<UserEntity> {
    const { siteIds, ...dto } = updateDto;
    const updatingUser = await this.findByIdAndSiteId(id, siteId);
    const { roles: existingRoles, ...updating } = updatingUser;
    const { imageName: existingImageName } = updatingUser;
    if (imageName && existingImageName) {
      await this.fileService.deleteFile(existingImageName);
    }

    const currentRoles = existingRoles.filter((role) => role.siteId !== siteId);
    const newRoles = await this.roleRepository.findBy({ id: In([updateDto.roleId]), siteId });
    const sites =
      siteIds && siteIds.length > 0
        ? {
          sites: await this.siteRepository.findBy({ id: In(siteIds) }),
        }
        : { sites: [] };

    return this.userRepository.save({
      ...updating,
      ...dto,
      ...sites,
      roles: [...currentRoles, ...newRoles],
      imageName: !imageName ? existingImageName : imageName,
      updatedAt: new Date(),
    });
  }

  async changePassword(id: number, changePasswordDto: ChangePasswordDto, siteId: number): Promise<void> {
    const { password } = changePasswordDto;
    const updatingUser = await this.findByIdAndSiteId(id, siteId);
    const passwordHash = await bcrypt.hash(password, this.saltOrRounds);
    await this.userRepository.save({
      id: updatingUser.id,
      passwordHash,
      updatedAt: new Date(),
    });
  }

  async delete(id: number, siteId: number): Promise<void> {
    await this.userRepository
      .createQueryBuilder('u')
      .innerJoin('u.sites', 'us', ':siteId is null or us.id = :siteId', { siteId })
      .delete()
      .where('u.id = :id', { id })
      .execute();
  }

  async deleteMany(ids: number[], siteId: number): Promise<void> {
    await this.userRepository
      .createQueryBuilder('u')
      .innerJoin('u.sites', 'us', ':siteId is null or us.id = :siteId', { siteId })
      .delete()
      .where('u.id in (:ids)', { ids })
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
