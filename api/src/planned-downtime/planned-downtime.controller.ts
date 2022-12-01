import { Body, Controller, Delete, Get, NotFoundException, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { IdListDto } from '../common/dto/id-list.dto';
import { PagedLisDto } from '../common/dto/paged-list.dto';
import { PlannedDowntimeService } from './planned-downtime.service';
import { CreatePlannedDowntimeDto } from './dto/create-planned-downtime.dto';
import { FilterPlannedDowntimeDto } from './dto/filter-planned-downtime.dto';
import { UpdatePlannedDowntimeDto } from './dto/update-planned-downtime.dto';
import { PlannedDowntime } from '../common/entities/planned-downtime';
import { SiteIdPipe } from '../common/pipe/site-id-pipe.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ReqDec } from '../common/decorator/req-dec';
import { Site } from '../common/entities/site';

@UseGuards(JwtAuthGuard)
@Controller('planned-downtimes')
export class PlannedDowntimeController {
  constructor(private readonly plannedDowntimeService: PlannedDowntimeService) {}

  @Get()
  findFilter(
    @ReqDec(SiteIdPipe) siteId: number,
    @Query() filterDto: FilterPlannedDowntimeDto,
  ): Promise<PagedLisDto<PlannedDowntime>> {
    return this.plannedDowntimeService.findPagedList(filterDto);
  }

  @Get('all')
  findAll(@ReqDec(SiteIdPipe) siteId: number): Promise<PlannedDowntime[]> {
    return this.plannedDowntimeService.findAll(siteId);
  }

  @Get(':id')
  async findById(@Param('id') id: number, @ReqDec(SiteIdPipe) siteId: number): Promise<PlannedDowntime> {
    const plannedDowntime = await this.plannedDowntimeService.findById(id, siteId);
    if (!plannedDowntime) {
      throw new NotFoundException();
    }

    return plannedDowntime;
  }

  @Post()
  create(
    @Body() createDto: CreatePlannedDowntimeDto,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @ReqDec(SiteIdPipe) siteId: number,
  ): Promise<PlannedDowntime> {
    return this.plannedDowntimeService.create(createDto);
  }

  @Put(':id')
  update(
    @Param('id') id: number,
    @Body() updateDto: UpdatePlannedDowntimeDto,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @ReqDec(SiteIdPipe) siteId: number,
  ): Promise<PlannedDowntime> {
    return this.plannedDowntimeService.update(id, updateDto);
  }

  @Delete(':id')
  async delete(
    @Param('id') id: number,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @ReqDec(SiteIdPipe) siteId: number,
  ): Promise<void> {
    await this.plannedDowntimeService.delete(id);
  }

  @Delete()
  async deleteMany(
    @Query() dto: IdListDto,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @ReqDec(SiteIdPipe) siteId: number,
  ): Promise<void> {
    await this.plannedDowntimeService.deleteMany(dto.ids);
  }
}
