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
import { DeviceService } from './device.service';
import { CreateDeviceDto } from './dto/create-device.dto';
import { FilterDeviceDto } from './dto/filter-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { Device } from '../common/entities/device';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ReqDec } from '../common/decorator/req-dec';
import { SiteIdPipe } from '../common/pipe/site-id-pipe.service';
import { Site } from '../common/entities/site';

@UseGuards(JwtAuthGuard)
@Controller('devices')
export class DeviceController {
  constructor(private readonly deviceService: DeviceService) {}

  @Get()
  @UseInterceptors(ClassSerializerInterceptor)
  findFilter(
    @Query() filterDto: FilterDeviceDto,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @ReqDec(SiteIdPipe) siteId: number,
  ): Promise<PagedLisDto<Device>> {
    return this.deviceService.findFilter(filterDto);
  }

  @Get('all')
  @UseInterceptors(ClassSerializerInterceptor)
  findAll(@ReqDec(SiteIdPipe) siteId: number): Promise<Device[]> {
    return this.deviceService.findAll(siteId);
  }

  @Get(':id')
  @UseInterceptors(ClassSerializerInterceptor)
  async findById(@Param('id') id: number, @ReqDec(SiteIdPipe) siteId: number): Promise<Device> {
    const device = await this.deviceService.findById(id, siteId);
    if (!device) {
      throw new NotFoundException();
    }

    return device;
  }

  @Post()
  @UseInterceptors(ClassSerializerInterceptor)
  create(@Body() createDto: CreateDeviceDto, @ReqDec(SiteIdPipe) siteId: number): Promise<Device> {
    return this.deviceService.create({
      ...createDto,
      siteId: siteId,
    });
  }

  @Put(':id')
  @UseInterceptors(ClassSerializerInterceptor)
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateDeviceDto,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @ReqDec(SiteIdPipe) siteId: number,
  ): Promise<Device> {
    return this.deviceService.update(Number(id), updateDto);
  }

  @Delete(':id')
  async delete(
    @Param('id') id: number,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @ReqDec(SiteIdPipe) siteId: number,
  ): Promise<void> {
    await this.deviceService.delete(id);
  }

  @Delete()
  async deleteMany(
    @Query() dto: IdListDto,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @ReqDec(SiteIdPipe) siteId: number,
  ): Promise<void> {
    await this.deviceService.deleteMany(dto.ids);
  }
}
