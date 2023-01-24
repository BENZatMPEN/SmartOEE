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
import { IdListDto } from '../common/dto/id-list.dto';
import { PlanningService } from './planning.service';
import { CreatePlanningDto } from './dto/create-planning.dto';
import { UpdatePlanningDto } from './dto/update-planning.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PlanningEntity } from '../common/entities/planning-entity';
import { FilterPlanningDto } from './dto/filter-planning.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import * as XLSX from 'xlsx';

@UseGuards(JwtAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
@Controller('plannings')
export class PlanningController {
  constructor(private readonly planningService: PlanningService) {}

  @Post('import')
  async import(
    @Body('items', new ParseArrayPipe({ items: CreatePlanningDto })) items: CreatePlanningDto[],
    @Query('siteId') siteId: number,
  ): Promise<void> {
    for (const createDto of items) {
      await this.planningService.create(createDto, siteId);
    }
  }

  @Post('import-excel')
  @UseInterceptors(FileInterceptor('file'))
  async importExcel(@UploadedFile('file') file: Express.Multer.File, @Query('siteId') siteId: number): Promise<void> {
    const workBook = XLSX.read(file.buffer, { type: 'buffer' });
    if (workBook.SheetNames.length < 0) {
      return;
    }

    const items = XLSX.utils.sheet_to_json(workBook.Sheets[workBook.SheetNames[0]]);
    for (const item of items) {
      await this.planningService.create(item as CreatePlanningDto, siteId);
    }
  }

  @Get()
  findAll(@Query() filter: FilterPlanningDto): Promise<PlanningEntity[]> {
    return this.planningService.findByDateRange(filter);
  }

  @Get(':id')
  findById(@Param('id') id: number, @Query('siteId') siteId: number): Promise<PlanningEntity> {
    return this.planningService.findById(id, siteId);
  }

  @Post()
  create(@Body() createDto: CreatePlanningDto, @Query('siteId') siteId: number): Promise<PlanningEntity> {
    return this.planningService.create(createDto, siteId);
  }

  @Put(':id')
  update(
    @Param('id') id: number,
    @Body() updateDto: UpdatePlanningDto,
    @Query('siteId') siteId: number,
  ): Promise<PlanningEntity> {
    return this.planningService.update(id, updateDto, siteId);
  }

  @Delete(':id')
  async delete(@Param('id') id: number, @Query('siteId') siteId: number): Promise<void> {
    await this.planningService.delete(id, siteId);
  }

  @Delete()
  async deleteMany(@Query() dto: IdListDto, @Query('siteId') siteId: number): Promise<void> {
    await this.planningService.deleteMany(dto.ids, siteId);
  }
}
