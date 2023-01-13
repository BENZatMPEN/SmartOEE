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
import { DeviceService } from './device.service';
import { CreateDeviceDto } from './dto/create-device.dto';
import { FilterDeviceDto } from './dto/filter-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { DeviceEntity } from '../common/entities/device-entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
@Controller('devices')
export class DeviceController {
  constructor(private readonly deviceService: DeviceService) {}

  @Get()
  findFilter(@Query() filterDto: FilterDeviceDto): Promise<PagedLisDto<DeviceEntity>> {
    return this.deviceService.findFilter(filterDto);
  }

  @Get('all')
  findAll(@Query('siteId') siteId: number): Promise<DeviceEntity[]> {
    return this.deviceService.findAll(siteId);
  }

  @Get(':id')
  async findById(@Param('id') id: number, @Query('siteId') siteId: number): Promise<DeviceEntity> {
    const device = await this.deviceService.findById(id, siteId);
    if (!device) {
      throw new NotFoundException();
    }
    return device;
  }

  @Post()
  create(@Body() createDto: CreateDeviceDto, @Query('siteId') siteId: number): Promise<DeviceEntity> {
    return this.deviceService.create(createDto, siteId);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateDeviceDto,
    @Query('siteId') siteId: number,
  ): Promise<DeviceEntity> {
    return this.deviceService.update(Number(id), updateDto, siteId);
  }

  @Delete(':id')
  async delete(@Param('id') id: number, @Query('siteId') siteId: number): Promise<void> {
    await this.deviceService.delete(id, siteId);
  }

  @Delete()
  async deleteMany(
    @Query('ids', new ParseArrayPipe({ items: Number })) ids: number[],
    @Query('siteId') siteId: number,
  ): Promise<void> {
    await this.deviceService.deleteMany(ids, siteId);
  }
}
