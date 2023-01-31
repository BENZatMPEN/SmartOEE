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
import { CreateDashboardDto } from './dto/create-dashboard.dto';
import { UpdateDashboardDto } from './dto/update-dashboard.dto';
import { DashboardService } from './dashboard.service';
import { DashboardEntity } from '../common/entities/dashboard-entity';
import { FilterDashboardDto } from './dto/filter-dashboard.dto';
import { PagedLisDto } from '../common/dto/paged-list.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('api/dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  @UseInterceptors(ClassSerializerInterceptor)
  async findFilter(@Query() filterDto: FilterDashboardDto): Promise<PagedLisDto<DashboardEntity>> {
    return this.dashboardService.findPagedList(filterDto);
  }

  @Get('all')
  @UseInterceptors(ClassSerializerInterceptor)
  findAll(@Query('siteId') siteId: number): Promise<DashboardEntity[]> {
    return this.dashboardService.findAll(siteId);
  }

  @Get(':id')
  async findById(@Param('id') id: number, @Query('siteId') siteId: number): Promise<DashboardEntity> {
    return this.dashboardService.findById(id, siteId);
  }

  @Post()
  async create(@Body() createDto: CreateDashboardDto, @Query('siteId') siteId: number): Promise<DashboardEntity> {
    return this.dashboardService.create(createDto, siteId);
  }

  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() updateDto: UpdateDashboardDto,
    @Query('siteId') siteId: number,
  ): Promise<DashboardEntity> {
    return this.dashboardService.update(id, updateDto, siteId);
  }

  @Delete(':id')
  async delete(@Param('id') id: number, @Query('siteId') siteId: number): Promise<void> {
    await this.dashboardService.delete(id, siteId);
  }

  @Delete()
  async deleteMany(
    @Query('ids', new ParseArrayPipe({ items: Number })) ids: number[],
    @Query('siteId') siteId: number,
  ): Promise<void> {
    await this.dashboardService.deleteMany(ids, siteId);
  }
}
