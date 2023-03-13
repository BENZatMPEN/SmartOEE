import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { UserEntity } from '../common/entities/user.entity';
import { FilterAdminUserDto } from './dto/filter-admin-user.dto';
import { PagedLisDto } from '../common/dto/paged-list.dto';
import { UpdateAdminUserDto } from './dto/update-admin-user.dto';
import { CreateAdminUserDto } from './dto/create-admin-user.dto';
import * as bcrypt from 'bcrypt';
import { SiteEntity } from '../common/entities/site.entity';
import { FileService } from '../common/services/file.service';
import { ChangePasswordDto } from '../user/dto/change-password.dto';

@Injectable()
export class AdminUserService {
  constructor(
    private readonly fileService: FileService,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(SiteEntity)
    private siteRepository: Repository<SiteEntity>,
  ) {}

  private readonly saltOrRounds = 10;

  async findPagedList(filterDto: FilterAdminUserDto): Promise<PagedLisDto<UserEntity>> {
    const offset = filterDto.page == 0 ? 0 : filterDto.page * filterDto.rowsPerPage;
    const [rows, count] = await this.userRepository
      .createQueryBuilder()
      .where('(:search is null or firstName like :search or lastName like :search or email like :search)')
      .orderBy(`${filterDto.orderBy}`, filterDto.order === 'asc' ? 'ASC' : 'DESC')
      .skip(offset)
      .take(filterDto.rowsPerPage)
      .setParameters({ search: filterDto.search ? `%${filterDto.search}%` : null })
      .getManyAndCount();

    return { list: rows, count: count };
  }

  findById(id: number): Promise<UserEntity> {
    return this.userRepository
      .createQueryBuilder('u')
      .leftJoinAndSelect('u.sites', 'us')
      .where('u.id = :id', { id })
      .getOne();
  }

  async create(createDto: CreateAdminUserDto, imageName: string): Promise<UserEntity> {
    const { password, siteIds, ...dto } = createDto;
    const passwordHash = await bcrypt.hash(password, this.saltOrRounds);
    const sites =
      siteIds && siteIds.length > 0
        ? {
            sites: await this.siteRepository.findBy({ id: In(siteIds) }),
          }
        : { sites: [] };

    return await this.userRepository.save({
      ...dto,
      ...sites,
      passwordHash,
      imageName,
      isAdmin: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  async update(id: number, updateDto: UpdateAdminUserDto, imageName: string): Promise<UserEntity> {
    const { siteIds, ...dto } = updateDto;
    const updatingUser = await this.userRepository.findOneBy({ id });
    const { imageName: existingImageName } = updatingUser;
    if (imageName && existingImageName) {
      await this.fileService.deleteFile(existingImageName);
    }

    const sites =
      siteIds && siteIds.length > 0
        ? {
            sites: await this.siteRepository.findBy({ id: In(siteIds) }),
          }
        : { sites: [] };

    return await this.userRepository.save({
      ...updatingUser,
      ...dto,
      ...sites,
      imageName: !imageName ? existingImageName : imageName,
      updatedAt: new Date(),
    });
  }

  async changePassword(id: number, changePasswordDto: ChangePasswordDto): Promise<void> {
    const { password } = changePasswordDto;
    const updatingUser = await this.userRepository.findOneBy({ id });
    const passwordHash = await bcrypt.hash(password, this.saltOrRounds);
    await this.userRepository.save({
      id: updatingUser.id,
      passwordHash,
      updatedAt: new Date(),
    });
  }

  async delete(id: number): Promise<void> {
    await this.userRepository.delete(id);
  }

  async deleteMany(ids: number[]): Promise<void> {
    await this.userRepository.delete(ids);
  }
}
