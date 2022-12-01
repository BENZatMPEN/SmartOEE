import { Body, Controller, Delete, Get, NotFoundException, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { IdListDto } from '../common/dto/id-list.dto';
import { PagedLisDto } from '../common/dto/paged-list.dto';
import { DeviceModelService } from './device-model.service';
import { CreateDeviceModelDto } from './dto/create-device-model.dto';
import { FilterDeviceModelDto } from './dto/filter-device-model.dto';
import { UpdateDeviceModelDto } from './dto/update-device-model.dto';
import { DeviceModel } from '../common/entities/device-model';
import { ReqDec } from '../common/decorator/req-dec';
import { SiteIdPipe } from '../common/pipe/site-id-pipe.service';
import { Site } from '../common/entities/site';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('device-models')
export class DeviceModelController {
  constructor(private readonly deviceModelService: DeviceModelService) {}

  @Get()
  findFilter(
    @Query() filterDto: FilterDeviceModelDto,
    @ReqDec(SiteIdPipe) siteId: number,
  ): Promise<PagedLisDto<DeviceModel>> {
    return this.deviceModelService.findFilter(filterDto);
  }

  @Get('all')
  findAll(@ReqDec(SiteIdPipe) siteId: number): Promise<DeviceModel[]> {
    return this.deviceModelService.findAll(siteId);
  }

  @Get(':id')
  async findById(@Param('id') id: number, @ReqDec(SiteIdPipe) siteId: number): Promise<DeviceModel> {
    const deviceModel = await this.deviceModelService.findById(id, siteId);
    if (!deviceModel) {
      throw new NotFoundException();
    }

    return deviceModel;
  }

  @Post()
  create(@Body() createDto: CreateDeviceModelDto, @ReqDec(SiteIdPipe) siteId: number): Promise<DeviceModel> {
    return this.deviceModelService.create({
      ...createDto,
      siteId: siteId,
    });
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateDeviceModelDto,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @ReqDec(SiteIdPipe) siteId: number,
  ): Promise<DeviceModel> {
    return this.deviceModelService.update(Number(id), updateDto);
  }

  @Delete(':id')
  async delete(
    @Param('id') id: number,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @ReqDec(SiteIdPipe) siteId: number,
  ): Promise<void> {
    await this.deviceModelService.delete(id);
  }

  @Delete()
  async deleteMany(
    @Query() dto: IdListDto,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @ReqDec(SiteIdPipe) siteId: number,
  ): Promise<void> {
    await this.deviceModelService.deleteMany(dto.ids);
  }
}
