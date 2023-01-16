import { Injectable } from '@nestjs/common';
import { PagedLisDto } from '../common/dto/paged-list.dto';
import { CreateRoleDto } from './dto/create-role.dto';
import { FilterRoleDto } from './dto/filter-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoleEntity } from '../common/entities/role-entity';
import { OptionItem } from '../common/type/option-item';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(RoleEntity)
    private roleRepository: Repository<RoleEntity>,
  ) {}

  async findPagedList(filterDto: FilterRoleDto): Promise<PagedLisDto<RoleEntity>> {
    const offset = filterDto.page == 0 ? 0 : filterDto.page * filterDto.rowsPerPage;
    const [rows, count] = await this.roleRepository
      .createQueryBuilder()
      .where('siteId = :siteId', { siteId: filterDto.siteId })
      .andWhere(':search is null or name like :search')
      .orderBy(`${filterDto.orderBy}`, filterDto.order === 'asc' ? 'ASC' : 'DESC')
      .skip(offset)
      .take(filterDto.rowsPerPage)
      .setParameters({ search: filterDto.search ? `%${filterDto.search}%` : null })
      .getManyAndCount();

    return { list: rows, count: count };
  }

  async findOptions(siteId: number): Promise<OptionItem[]> {
    const list = await this.roleRepository.findBy({ siteId });

    return list.map((item) => ({ id: item.id, name: item.name }));
  }

  // findAll(): Promise<RoleEntity[]> {
  //   return this.roleRepository.find({ where: { deleted: false } });
  // }

  findById(id: number, siteId: number): Promise<RoleEntity> {
    return this.roleRepository.findOneBy({ id, siteId });
  }

  create(createDto: CreateRoleDto, siteId: number): Promise<RoleEntity> {
    return this.roleRepository.save({
      ...createDto,
      siteId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  async update(id: number, updateDto: UpdateRoleDto, siteId: number): Promise<RoleEntity> {
    const updating = await this.roleRepository.findOneBy({ id, siteId });
    return this.roleRepository.save({
      ...updating,
      ...updateDto,
      updatedAt: new Date(),
    });
  }

  async delete(id: number, siteId: number): Promise<void> {
    await this.roleRepository
      .createQueryBuilder()
      .delete()
      .where('id = :id and siteId = :siteId', { id, siteId })
      .execute();
  }

  async deleteMany(ids: number[], siteId: number): Promise<void> {
    await this.roleRepository
      .createQueryBuilder()
      .delete()
      .where('id in (:ids) and siteId = :siteId', { ids, siteId })
      .execute();
  }
}
