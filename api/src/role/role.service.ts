import { Injectable } from '@nestjs/common';
import { PagedLisDto } from '../common/dto/paged-list.dto';
import { CreateRoleDto } from './dto/create-role.dto';
import { FilterRoleDto } from './dto/filter-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Role } from '../common/entities/role';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
  ) {}

  async findPagedList(filterDto: FilterRoleDto): Promise<PagedLisDto<Role>> {
    const offset = filterDto.page == 0 ? 0 : filterDto.page * filterDto.rowsPerPage;
    const [rows, count] = await this.roleRepository
      .createQueryBuilder()
      .where('deleted = false')
      .andWhere(':search is null or name like :search')
      .orderBy(`${filterDto.orderBy}`, filterDto.order === 'asc' ? 'ASC' : 'DESC')
      .skip(offset)
      .take(filterDto.rowsPerPage)
      .setParameters({ search: filterDto.search ? `%${filterDto.search}%` : null })
      .getManyAndCount();

    return { list: rows, count: count };
  }

  findAll(): Promise<Role[]> {
    return this.roleRepository.find({ where: { deleted: false } });
  }

  findById(id): Promise<Role> {
    return this.roleRepository.findOne({ where: { id, deleted: false } });
  }

  create(createDto: CreateRoleDto): Promise<Role> {
    return this.roleRepository.save({
      ...createDto,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  async update(id: number, updateDto: UpdateRoleDto): Promise<Role> {
    return this.roleRepository.save({
      ...updateDto,
      updatedAt: new Date(),
    });
  }

  async delete(id: number): Promise<void> {
    const role = await this.roleRepository.findOneBy({ id });
    role.deleted = true;
    role.updatedAt = new Date();
    await this.roleRepository.save(role);
  }

  async deleteMany(ids: number[]): Promise<void> {
    const roles = await this.roleRepository.findBy({ id: In(ids) });
    await this.roleRepository.save(
      roles.map((role) => {
        role.deleted = true;
        role.updatedAt = new Date();
        return role;
      }),
    );
  }
}
