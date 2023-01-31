import { Body, Controller, Delete, Get, Param, ParseArrayPipe, Post, Put, Query, UseGuards } from '@nestjs/common';
import { PagedLisDto } from '../common/dto/paged-list.dto';
import { DeviceModelService } from './device-model.service';
import { CreateDeviceModelDto } from './dto/create-device-model.dto';
import { FilterDeviceModelDto } from './dto/filter-device-model.dto';
import { UpdateDeviceModelDto } from './dto/update-device-model.dto';
import { DeviceModelEntity } from '../common/entities/device-model-entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('api/device-models')
export class DeviceModelController {
  constructor(private readonly deviceModelService: DeviceModelService) {}

  @Get()
  findFilter(@Query() filterDto: FilterDeviceModelDto): Promise<PagedLisDto<DeviceModelEntity>> {
    return this.deviceModelService.findFilter(filterDto);
  }

  @Get('all')
  findAll(@Query('siteId') siteId: number): Promise<DeviceModelEntity[]> {
    return this.deviceModelService.findAll(siteId);
  }

  @Get(':id')
  findById(@Param('id') id: number, @Query('siteId') siteId: number): Promise<DeviceModelEntity> {
    return this.deviceModelService.findById(id, siteId);
  }

  @Post()
  create(@Body() createDto: CreateDeviceModelDto, @Query('siteId') siteId: number): Promise<DeviceModelEntity> {
    return this.deviceModelService.create(createDto, siteId);
  }

  @Put(':id')
  update(
    @Param('id') id: number,
    @Body() updateDto: UpdateDeviceModelDto,
    @Query('siteId') siteId: number,
  ): Promise<DeviceModelEntity> {
    return this.deviceModelService.update(id, updateDto, siteId);
  }

  @Delete(':id')
  async delete(@Param('id') id: number, @Query('siteId') siteId: number): Promise<void> {
    await this.deviceModelService.delete(id, siteId);
  }

  @Delete()
  async deleteMany(
    @Query('ids', new ParseArrayPipe({ items: Number })) ids: number[],
    @Query('siteId') siteId: number,
  ): Promise<void> {
    await this.deviceModelService.deleteMany(ids, siteId);
  }
}
