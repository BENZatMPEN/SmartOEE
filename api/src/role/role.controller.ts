import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { IdListDto } from '../common/dto/id-list.dto';
import { PagedLisDto } from '../common/dto/paged-list.dto';
import { CreateRoleDto } from './dto/create-role.dto';
import { FilterRoleDto } from './dto/filter-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RoleService } from './role.service';
import { Role } from '../common/entities/role';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ReqDec } from '../common/decorator/req-dec';
import { SiteIdPipe } from '../common/pipe/site-id-pipe.service';

@UseGuards(JwtAuthGuard)
@Controller('roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Get()
  async findFilter(@Query() filterDto: FilterRoleDto): Promise<PagedLisDto<Role>> {
    return this.roleService.findPagedList(filterDto);
  }

  @Get('all')
  async findAll(): Promise<Role[]> {
    return this.roleService.findAll();
  }

  @Get(':id')
  async findById(@Param('id') id: number): Promise<Role> {
    return this.roleService.findById(id);
  }

  @Post()
  async create(@ReqDec(SiteIdPipe) siteId: number, @Body() createDto: CreateRoleDto): Promise<Role> {
    return this.roleService.create({
      ...createDto,
      siteId,
    });
  }

  @Put(':id')
  async update(@Param('id') id: number, @Body() updateDto: UpdateRoleDto): Promise<Role> {
    return this.roleService.update(id, updateDto);
  }

  @Delete(':id')
  async delete(@Param('id') id: number): Promise<void> {
    await this.roleService.delete(id);
  }

  @Delete()
  async deleteMany(@Query() dto: IdListDto): Promise<void> {
    await this.roleService.deleteMany(dto.ids);
  }
}
