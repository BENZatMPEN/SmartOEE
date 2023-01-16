import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  ParseArrayPipe,
  Post,
  Put,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { PagedLisDto } from '../common/dto/paged-list.dto';
import { CreateRoleDto } from './dto/create-role.dto';
import { FilterRoleDto } from './dto/filter-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RoleService } from './role.service';
import { RoleEntity } from '../common/entities/role-entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OptionItem } from '../common/type/option-item';

@UseGuards(JwtAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
@Controller('roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Get()
  async findFilter(@Query() filterDto: FilterRoleDto): Promise<PagedLisDto<RoleEntity>> {
    return this.roleService.findPagedList(filterDto);
  }

  @Get('options')
  findAllOee(@Query('siteId') siteId: number): Promise<OptionItem[]> {
    return this.roleService.findOptions(siteId);
  }

  @Get(':id')
  async findById(@Param('id') id: number, @Query('siteId') siteId: number): Promise<RoleEntity> {
    return this.roleService.findById(id, siteId);
  }

  @Post()
  async create(@Body() createDto: CreateRoleDto, @Query('siteId') siteId: number): Promise<RoleEntity> {
    return this.roleService.create(createDto, siteId);
  }

  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() updateDto: UpdateRoleDto,
    @Query('siteId') siteId: number,
  ): Promise<RoleEntity> {
    return this.roleService.update(id, updateDto, siteId);
  }

  @Delete(':id')
  async delete(@Param('id') id: number, @Query('siteId') siteId: number): Promise<void> {
    await this.roleService.delete(id, siteId);
  }

  @Delete()
  async deleteMany(
    @Query('ids', new ParseArrayPipe({ items: Number })) ids: number[],
    @Query('siteId') siteId: number,
  ): Promise<void> {
    await this.roleService.deleteMany(ids, siteId);
  }
}
