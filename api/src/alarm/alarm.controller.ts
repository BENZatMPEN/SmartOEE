import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { IdListDto } from '../common/dto/id-list.dto';
import { PagedLisDto } from '../common/dto/paged-list.dto';
import { AlarmService } from './alarm.service';
import { CreateAlarmDto } from './dto/create-alarm.dto';
import { FilterAlarmDto } from './dto/filter-alarm.dto';
import { UpdateAlarmDto } from './dto/update-alarm.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ReqDec } from '../common/decorator/req-dec';
import { SiteIdPipe } from '../common/pipe/site-id-pipe.service';
import { Site } from '../common/entities/site';
import { Alarm } from '../common/entities/alarm';

@UseGuards(JwtAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
@Controller('alarms')
export class AlarmController {
  constructor(private readonly alarmService: AlarmService) {}

  @Get()
  findFilter(
    @Query() filterDto: FilterAlarmDto,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @ReqDec(SiteIdPipe) siteId: number,
  ): Promise<PagedLisDto<Alarm>> {
    return this.alarmService.findPagedList(filterDto);
  }

  @Get('all')
  findAll(@ReqDec(SiteIdPipe) siteId: number): Promise<Alarm[]> {
    return this.alarmService.findAll(siteId);
  }

  @Get(':id')
  async findById(@Param('id') id: number, @ReqDec(SiteIdPipe) siteId: number): Promise<Alarm> {
    const alarm = await this.alarmService.findById(id, siteId);
    if (!alarm) {
      throw new NotFoundException();
    }

    return alarm;
  }

  @Post()
  create(
    @Body() createDto: CreateAlarmDto,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @ReqDec(SiteIdPipe) siteId: number,
  ): Promise<Alarm> {
    return this.alarmService.create(createDto);
  }

  @Put(':id')
  update(
    @Param('id') id: number,
    @Body() updateDto: UpdateAlarmDto,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @ReqDec(SiteIdPipe) siteId: number,
  ): Promise<Alarm> {
    return this.alarmService.update(id, updateDto);
  }

  @Delete(':id')
  async delete(
    @Param('id') id: number,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @ReqDec(SiteIdPipe) siteId: number,
  ): Promise<void> {
    await this.alarmService.delete(id);
  }

  @Delete()
  async deleteMany(
    @Query() dto: IdListDto,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @ReqDec(SiteIdPipe) siteId: number,
  ): Promise<void> {
    await this.alarmService.deleteMany(dto.ids);
  }
}
