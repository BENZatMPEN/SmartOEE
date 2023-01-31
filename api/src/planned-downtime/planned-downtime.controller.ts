import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseArrayPipe,
  Post,
  Put,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { PagedLisDto } from '../common/dto/paged-list.dto';
import { PlannedDowntimeService } from './planned-downtime.service';
import { CreatePlannedDowntimeDto } from './dto/create-planned-downtime.dto';
import { FilterPlannedDowntimeDto } from './dto/filter-planned-downtime.dto';
import { UpdatePlannedDowntimeDto } from './dto/update-planned-downtime.dto';
import { PlannedDowntimeEntity } from '../common/entities/planned-downtime-entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
@Controller('api/planned-downtimes')
export class PlannedDowntimeController {
  constructor(private readonly plannedDowntimeService: PlannedDowntimeService) {}

  @Get()
  findFilter(@Query() filterDto: FilterPlannedDowntimeDto): Promise<PagedLisDto<PlannedDowntimeEntity>> {
    return this.plannedDowntimeService.findPagedList(filterDto);
  }

  @Get('all')
  findAll(@Query('siteId') siteId: number): Promise<PlannedDowntimeEntity[]> {
    return this.plannedDowntimeService.findAll(siteId);
  }

  @Get(':id')
  async findById(@Param('id') id: number, @Query('siteId') siteId: number): Promise<PlannedDowntimeEntity> {
    const plannedDowntime = await this.plannedDowntimeService.findById(id, siteId);
    if (!plannedDowntime) {
      throw new NotFoundException();
    }

    return plannedDowntime;
  }

  @Post()
  create(@Body() createDto: CreatePlannedDowntimeDto, @Query('siteId') siteId: number): Promise<PlannedDowntimeEntity> {
    return this.plannedDowntimeService.create(createDto, siteId);
  }

  @Put(':id')
  update(
    @Param('id') id: number,
    @Body() updateDto: UpdatePlannedDowntimeDto,
    @Query('siteId') siteId: number,
  ): Promise<PlannedDowntimeEntity> {
    return this.plannedDowntimeService.update(id, updateDto, siteId);
  }

  @Delete(':id')
  async delete(@Param('id') id: number, @Query('siteId') siteId: number): Promise<void> {
    await this.plannedDowntimeService.delete(id, siteId);
  }

  @Delete()
  async deleteMany(
    @Query('ids', new ParseArrayPipe({ items: Number })) ids: number[],
    @Query('siteId') siteId: number,
  ): Promise<void> {
    await this.plannedDowntimeService.deleteMany(ids, siteId);
  }
}
