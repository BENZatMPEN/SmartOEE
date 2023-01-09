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
import { AlarmService } from './alarm.service';
import { CreateAlarmDto } from './dto/create-alarm.dto';
import { FilterAlarmDto } from './dto/filter-alarm.dto';
import { UpdateAlarmDto } from './dto/update-alarm.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AlarmEntity } from '../common/entities/alarm-entity';

@UseGuards(JwtAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
@Controller('alarms')
export class AlarmController {
  constructor(private readonly alarmService: AlarmService) {}

  @Get()
  findFilter(@Query() filterDto: FilterAlarmDto): Promise<PagedLisDto<AlarmEntity>> {
    return this.alarmService.findPagedList(filterDto);
  }

  @Get('all')
  findAll(@Query('siteId') siteId: number): Promise<AlarmEntity[]> {
    return this.alarmService.findAll(siteId);
  }

  @Get(':id')
  findById(@Param('id') id: number, @Query('siteId') siteId: number): Promise<AlarmEntity> {
    return this.alarmService.findById(id, siteId);
  }

  @Post()
  create(@Body() createDto: CreateAlarmDto): Promise<AlarmEntity> {
    return this.alarmService.create(createDto);
  }

  @Put(':id')
  update(
    @Param('id') id: number,
    @Body() updateDto: UpdateAlarmDto,
    @Query('siteId') siteId: number,
  ): Promise<AlarmEntity> {
    return this.alarmService.update(id, updateDto, siteId);
  }

  @Delete(':id')
  async delete(@Param('id') id: number, @Query('siteId') siteId: number): Promise<void> {
    await this.alarmService.delete(id, siteId);
  }

  @Delete()
  async deleteMany(
    @Query('ids', new ParseArrayPipe({ items: Number })) ids: number[],
    @Query('siteId') siteId: number,
  ): Promise<void> {
    await this.alarmService.deleteMany(ids, siteId);
  }
}
