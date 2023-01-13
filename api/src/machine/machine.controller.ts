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
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { PagedLisDto } from '../common/dto/paged-list.dto';
import { MachineService } from './machine.service';
import { CreateMachineDto } from './dto/create-machine.dto';
import { FilterMachineDto } from './dto/filter-machine.dto';
import { UpdateMachineDto } from './dto/update-machine.dto';
import { MachineEntity } from '../common/entities/machine-entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { MachineWidgetDto } from './dto/machine-widget.dto';
import { FileSavePipe } from '../common/pipe/file-save.pipe';

@UseGuards(JwtAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
@Controller('machines')
export class MachineController {
  constructor(private readonly machineService: MachineService) {}

  @Get()
  findPagedList(@Query() filterDto: FilterMachineDto): Promise<PagedLisDto<MachineEntity>> {
    return this.machineService.findPagedList(filterDto);
  }

  @Get('all')
  findFilter(@Query('siteId') siteId: number): Promise<MachineEntity[]> {
    return this.machineService.findAll(siteId);
  }

  @Get(':id')
  findById(@Param('id') id: number, @Query('siteId') siteId: number): Promise<MachineEntity> {
    return this.machineService.findById(id, siteId);
  }

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  create(
    @Body() createDto: CreateMachineDto,
    @UploadedFile(FileSavePipe) image: string,
    @Query('siteId') siteId: number,
  ): Promise<MachineEntity> {
    console.log(createDto);
    return this.machineService.create(createDto, image, siteId);
  }

  @Put(':id')
  @UseInterceptors(FileInterceptor('image'))
  update(
    @Param('id') id: number,
    @Body() updateDto: UpdateMachineDto,
    @UploadedFile(FileSavePipe) image: string,
    @Query('siteId') siteId: number,
  ): Promise<MachineEntity> {
    return this.machineService.update(id, updateDto, image, siteId);
  }

  @Post(':id/widgets')
  async saveWidgets(
    @Param('id') id: number,
    @Body() machineWidgetDto: MachineWidgetDto,
    @Query('siteId') siteId: number,
  ): Promise<void> {
    await this.machineService.saveWidgets(id, machineWidgetDto, siteId);
  }

  @Delete(':id')
  async delete(@Param('id') id: number, @Query('siteId') siteId: number): Promise<void> {
    await this.machineService.delete(id, siteId);
  }

  @Delete()
  async deleteMany(
    @Query('ids', new ParseArrayPipe({ items: Number })) ids: number[],
    @Query('siteId') siteId: number,
  ): Promise<void> {
    await this.machineService.deleteMany(ids, siteId);
  }
}
