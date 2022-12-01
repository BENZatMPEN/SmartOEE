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
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { IdListDto } from '../common/dto/id-list.dto';
import { PagedLisDto } from '../common/dto/paged-list.dto';
import { MachineService } from './machine.service';
import { CreateMachineDto } from './dto/create-machine.dto';
import { FilterMachineDto } from './dto/filter-machine.dto';
import { UpdateMachineDto } from './dto/update-machine.dto';
import { Machine } from '../common/entities/machine';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ReqDec } from '../common/decorator/req-dec';
import { SiteIdPipe } from '../common/pipe/site-id-pipe.service';
import { Site } from '../common/entities/site';
import { FileInterceptor } from '@nestjs/platform-express';
import { MachineWidgetDto } from './dto/machine-widget.dto';

@UseGuards(JwtAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
@Controller('machines')
export class MachineController {
  constructor(private readonly machineService: MachineService) {}

  @Get()
  findPagedList(
    @Query() filterDto: FilterMachineDto,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @ReqDec(SiteIdPipe) siteId: number,
  ): Promise<PagedLisDto<Machine>> {
    return this.machineService.findPagedList(filterDto);
  }

  @Get('all')
  findFilter(@ReqDec(SiteIdPipe) siteId: number): Promise<Machine[]> {
    return this.machineService.findAll(siteId);
  }

  @Get(':id')
  async findById(@Param('id') id: number, @ReqDec(SiteIdPipe) siteId: number): Promise<Machine> {
    const machine = await this.machineService.findById(id, siteId);
    if (!machine) {
      throw new NotFoundException();
    }

    return machine;
  }

  @Post()
  create(
    @Body() createDto: CreateMachineDto,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @ReqDec(SiteIdPipe) siteId: number,
  ): Promise<Machine> {
    return this.machineService.create(createDto);
  }

  @Put(':id')
  update(
    @Param('id') id: number,
    @Body() updateDto: UpdateMachineDto,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @ReqDec(SiteIdPipe) siteId: number,
  ): Promise<Machine> {
    return this.machineService.update(id, updateDto);
  }

  @Post(':id/upload')
  @UseInterceptors(FileInterceptor('image'))
  async upload(
    @Param('id') id: number,
    @UploadedFile() image: Express.Multer.File,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @ReqDec(SiteIdPipe) siteId: number,
  ): Promise<void> {
    await this.machineService.upload(id, image);
  }

  @Post(':id/widgets')
  async saveWidgets(
    @Param('id') id: number,
    @Body() machineWidgetDto: MachineWidgetDto,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @ReqDec(SiteIdPipe) siteId: number,
  ): Promise<void> {
    await this.machineService.saveWidgets(id, machineWidgetDto);
  }

  @Delete(':id')
  async delete(
    @Param('id') id: number,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @ReqDec(SiteIdPipe) siteId: number,
  ): Promise<void> {
    await this.machineService.delete(id);
  }

  @Delete()
  async deleteMany(
    @Query() dto: IdListDto,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @ReqDec(SiteIdPipe) siteId: number,
  ): Promise<void> {
    await this.machineService.deleteMany(dto.ids);
  }
}
