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
  Res,
  StreamableFile,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { PlanningService } from './planning.service';
import { CreatePlanningDto } from './dto/create-planning.dto';
import { UpdatePlanningDto } from './dto/update-planning.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PlanningEntity } from '../common/entities/planning.entity';
import { FilterPlanningDto } from './dto/filter-planning.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import * as XLSX from 'xlsx';
import { ImportPlanningDto } from './dto/import-planning.dto';
import { UserService } from '../user/user.service';
import { ProductService } from '../product/product.service';
import { OeeService } from '../oee/oee.service';
import { ImportResultPlanningDto } from './dto/import-result-planning.dto';
import { Response } from 'express';
import * as dayjs from 'dayjs';
import { ImportErrorRowPlanningDto } from './dto/import-error-row-planning.dto';

@UseGuards(JwtAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
@Controller('api/plannings')
export class PlanningController {
  constructor(
    private readonly planningService: PlanningService,
    private readonly oeeService: OeeService,
    private readonly productService: ProductService,
    private readonly userService: UserService,
  ) {}

  // import using API
  @Post('import')
  async import(
    @Body('items', new ParseArrayPipe({ items: ImportPlanningDto })) items: ImportPlanningDto[],
    @Query('siteId') siteId: number,
  ): Promise<ImportResultPlanningDto> {
    const invalidRows = await this.importRows(items, siteId);
    return new ImportResultPlanningDto(invalidRows.length === 0, invalidRows.length > 0 ? invalidRows : undefined);
  }

  @Post('import-excel')
  @UseInterceptors(FileInterceptor('file'))
  async importExcel(
    @UploadedFile('file') file: Express.Multer.File,
    @Query('siteId') siteId: number,
  ): Promise<ImportResultPlanningDto> {
    const workBook = XLSX.read(file.buffer, { type: 'buffer' });
    if (workBook.SheetNames.length < 0) {
      return;
    }

    const items = XLSX.utils.sheet_to_json(workBook.Sheets[workBook.SheetNames[0]]) as ImportPlanningDto[];
    const invalidRows = await this.importRows(items, siteId);
    return new ImportResultPlanningDto(invalidRows.length === 0, invalidRows.length > 0 ? invalidRows : undefined);
  }

  private async importRows(items: ImportPlanningDto[], siteId: number): Promise<ImportErrorRowPlanningDto[]> {
    const invalidRows: ImportErrorRowPlanningDto[] = [];

    for (let i = 0; i < items.length; i++) {
      const dto = items[i] as ImportPlanningDto;
      const existingItem = await this.planningService.findByImport(dto, siteId);
      const oee = await this.oeeService.findByOeeCode(dto.oeeCode, siteId);
      const product = oee.oeeProducts.find((item) => item.product.sku === dto.productSku && !item.product.deleted);
      const user = await this.userService.findByEmail(dto.userEmail);

      if (existingItem || !oee || !product || !user) {
        const reason = existingItem ? 'exists' : !oee ? 'oee' : !product ? 'product' : !user ? 'user' : '';
        invalidRows.push(new ImportErrorRowPlanningDto(i, dto, reason));
        continue;
      }

      await this.planningService.create(
        {
          title: dto.title,
          lotNumber: dto.lotNumber,
          plannedQuantity: dto.plannedQuantity,
          startDate: dayjs(dto.startDate, 'YYYY-MM-DD HH:mm').toDate(),
          endDate: dayjs(dto.endDate, 'YYYY-MM-DD HH:mm').toDate(),
          oeeId: oee.id,
          productId: product.id,
          userId: user.id,
          remark: dto.remark,
        },
        siteId,
      );
    }

    return invalidRows;
  }

  @Get('export-excel')
  async export(
    @Query() filterDto: FilterPlanningDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const plannings = await this.planningService.findByDateRange(filterDto);
    const rows = plannings.map((item) => {
      return {
        id: item.id,
        oeeCode: item.oee.oeeCode,
        productSku: item.product.sku,
        userEmail: item.user?.email || '',
        plannedQuantity: item.plannedQuantity,
        title: item.title,
        lotNumber: item.lotNumber,
        startDate: dayjs(item.startDate).format('YYYY-MM-DD HH:mm'),
        endDate: dayjs(item.endDate).format('YYYY-MM-DD HH:mm'),
        remark: item.remark,
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.sheet_add_aoa(
      worksheet,
      [
        [
          'id',
          'oeeCode',
          'productSku',
          'userEmail',
          'plannedQuantity',
          'title',
          'lotNumber',
          'startDate',
          'endDate',
          'remark',
        ],
      ],
      { origin: 'A1' },
    );
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Plannings');

    const buf = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    res.set({
      'Content-Type': 'application/vnd.ms-excel',
      'Content-Disposition': `attachment; filename="history-logs.xlsx"`,
    });

    return new StreamableFile(buf);
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
  async deleteMany(
    @Query('ids', new ParseArrayPipe({ items: Number })) ids: number[],
    @Query('siteId') siteId: number,
  ): Promise<void> {
    await this.planningService.deleteMany(ids, siteId);
  }
}
