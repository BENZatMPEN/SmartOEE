import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Res,
  StreamableFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { OeeBatchService, ParetoData } from './oee-batch.service';
import { CreateOeeBatchDto } from './dto/create-oee-batch.dto';
import { OeeBatchPlannedDowntimeDto } from './dto/oee-batch-planned-downtime.dto';
import { OeeBatchEntity } from '../common/entities/oee-batch-entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ReqDec } from '../common/decorators/req-dec';
import { SiteIdPipe } from '../common/pipe/site-id.pipe';
import { SiteEntity } from '../common/entities/site-entity';
import { OeeBatchAEntity } from '../common/entities/oee-batch-a-entity';
import { OeeBatchPEntity } from '../common/entities/oee-batch-p-entity';
import { OeeBatchQEntity } from '../common/entities/oee-batch-q-entity';
import { OeeBatchPlannedDowntimeEntity } from '../common/entities/oee-batch-planned-downtime-entity';
import { PagedLisDto } from '../common/dto/paged-list.dto';
import { FilterOeeBatchDto } from './dto/filter-oee-batch.dto';
import type { Response } from 'express';
import * as XLSX from 'xlsx';
import { OEE_BATCH_HISTORY_TYPE_EDIT, OEE_PARAM_TYPE_A, OEE_PARAM_TYPE_P, OEE_PARAM_TYPE_Q } from '../common/constant';
import { OeeBatchHistoryEdit } from '../common/type/oee-batch-history-edit';
import { OeeBatchEditHistoryEntity } from '../common/entities/oee-batch-edit-history-entity';
import * as dayjs from 'dayjs';
import { OeeBatchStatsTimelineEntity } from '../common/entities/oee-batch-stats-timeline-entity';
import { fNumber2 } from '../common/utils/formatNumber';
import { OeeBatchStatsEntity } from '../common/entities/oee-batch-stats-entity';
import { OptionItem } from '../common/type/option-item';

@UseGuards(JwtAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
@Controller('oee-batches')
export class OeeBatchController {
  constructor(private readonly oeeBatchService: OeeBatchService) {}

  @Get()
  findPagedList(
    @Query() filterDto: FilterOeeBatchDto,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @ReqDec(SiteIdPipe) siteId: number,
  ): Promise<PagedLisDto<OeeBatchEntity>> {
    return this.oeeBatchService.findPagedList(filterDto);
  }

  @Get('options')
  findAllOee(@ReqDec(SiteIdPipe) siteId: number): Promise<OptionItem[]> {
    return this.oeeBatchService.findOptions(siteId);
  }

  @Get(':id')
  findById(@Param('id') id: number, @Query('oeeId') oeeId: number): Promise<OeeBatchEntity> {
    return this.oeeBatchService.findByIdAndOeeId(id, oeeId);
  }

  @Post()
  async create(
    @Query('oeeId') oeeId: string,
    @Body() createDto: CreateOeeBatchDto,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @ReqDec(SiteIdPipe) siteId: number,
  ): Promise<OeeBatchEntity> {
    return this.oeeBatchService.create(Number(oeeId), createDto);
  }

  // @Get('
  //
  // working-batch')
  // async workingBatch(
  //   @Query('oeeId') oeeId: number,
  //   // eslint-disable-next-line @typescript-eslint/no-unused-vars
  //   @ReqDec(SitePipe) site: Site,
  // ): Promise<OeeBatch> {
  //   return this.oeeBatchService.findWorkingBatchByOeeId(oeeId);
  //   // const oee = await this.oeeService.findById(oeeId);
  //   // return new Promise<OeeBatch>((resolve, reject) => {
  //   //   oee ? resolve(this.oeeBatchService.findWorkingBatchByOeeId(oeeId)) : reject(new BadRequestException());
  //   // });
  //   // return null;
  // }

  @Put(':id/start')
  start(@Param('id') id: number): Promise<Date> {
    return this.oeeBatchService.startBatch(id);
  }

  @Put(':id/end')
  async end(@Param('id') id: string): Promise<boolean> {
    const batchId = Number(id);
    const toBeStopped = true;
    await this.oeeBatchService.update1(batchId, {
      toBeStopped,
    });

    return toBeStopped;
  }

  @Put(':id/set-planned-downtime')
  async setPlannedDowntime(
    @Param('id') id: string,
    @Body() plannedDowntimeDto: OeeBatchPlannedDowntimeDto,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @ReqDec(SiteIdPipe) siteId: number,
  ): Promise<void> {
    const batchId = Number(id);
    await this.oeeBatchService.createPlannedDowntime(batchId, plannedDowntimeDto);
  }

  @Put(':id/remove-planned-downtime')
  async removeActivePlannedDowntime(@Param('id') id: string): Promise<void> {
    const batchId = Number(id);
    await this.oeeBatchService.expiredActivePlannedDowntime(batchId);
  }

  @Get(':id/active-planned-downtime')
  getActivePlannedDowntime(@Param('id') id: number): Promise<OeeBatchPlannedDowntimeEntity> {
    return this.oeeBatchService.findActivePlannedDowntimeById(id);
  }

  @Get(':id/a-params')
  getOeeBatchAs(@Param('id') id: number): Promise<OeeBatchAEntity[]> {
    return this.oeeBatchService.findBatchAsById(id);
  }

  @Patch(':id/a-param')
  saveOeeBatchAs(@Param('id') id: number, @Body() updateDto: any): Promise<OeeBatchAEntity> {
    return this.oeeBatchService.updateBatchA(updateDto.id, updateDto);
  }

  @Get(':id/p-params')
  getOeeBatchPs(@Param('id') id: number): Promise<OeeBatchPEntity[]> {
    return this.oeeBatchService.findBatchPsByIdAndMinorStop(id);
  }

  @Patch(':id/p-param')
  saveOeeBatchPs(@Param('id') id: number, @Body() updateDto: any): Promise<OeeBatchPEntity> {
    return this.oeeBatchService.updateBatchP(updateDto.id, updateDto);
  }

  @Get(':id/q-params')
  getOeeBatchQs(@Param('id') id: string): Promise<OeeBatchQEntity[]> {
    const batchId = Number(id);
    return this.oeeBatchService.findBatchQsById(batchId);
  }

  @Post(':id/q-params')
  async saveOeeBatchQs(@Param('id') id: string, @Body() updateDto: any): Promise<void> {
    const batchId = Number(id);
    await this.oeeBatchService.updateBatchQs(batchId, updateDto);
  }

  @Patch(':id')
  async updateOeeBatch(@Param('id') id: number, @Body() updateDto: any): Promise<void> {
    await this.oeeBatchService.update(id, updateDto);
  }

  @Get(':id/download-logs')
  async downloadLogs(@Param('id') id: number, @Res({ passthrough: true }) res: Response): Promise<StreamableFile> {
    const batch = await this.oeeBatchService.findById(id);
    const oeeBatchLogs = await this.oeeBatchService.findBatchLogsById(id);
    const rows = oeeBatchLogs.map((item) => {
      const { data } = item;
      const {
        date,
        time,
        productionName,
        product,
        lotNo,
        cycleTime,
        totalAvailableTime,
        loadingTime,
        operatingTime,
        plannedDowntime,
        downtime,
        planned,
        target,
        actual,
        diff,
        efficiency,
        totalProduct,
        goodProduct,
        defectProduct,
        batchStatus,
        pStopSeconds,
        oee,
        a,
        p,
        q,
        ...other
      } = data;

      return {
        date,
        time,
        productionName,
        product,
        lotNo,
        cycleTime,
        totalAvailableTime,
        loadingTime,
        operatingTime,
        plannedDowntime,
        downtime,
        planned,
        target: fNumber2(target),
        actual,
        diff,
        efficiency: fNumber2(efficiency),
        totalProduct,
        goodProduct,
        defectProduct,
        batchStatus,
        pStopSeconds,
        oee: fNumber2(oee),
        a: fNumber2(a),
        p: fNumber2(p),
        q: fNumber2(q),
        ...other,
      };
    });

    const { machines } = batch;
    const mcParamAs = machines
      .map((machine) => machine.parameters.filter((param) => param.oeeType === OEE_PARAM_TYPE_A))
      .flat();
    const mcParamPs = machines
      .map((machine) => machine.parameters.filter((param) => param.oeeType === OEE_PARAM_TYPE_P))
      .flat();
    const mcParamQs = machines
      .map((machine) => machine.parameters.filter((param) => param.oeeType === OEE_PARAM_TYPE_Q))
      .flat();

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.sheet_add_aoa(
      worksheet,
      [
        [
          'Date',
          'Time',
          'OEE (Production Name)',
          'Product (SKU)',
          'Lot No.',
          'Cycle Time',
          'Total Available Time',
          'Loading Time',
          'Operating Time',
          'Planned Downtime',
          'Downtime Losses',
          'Planned',
          'Target',
          'Actual',
          'Diff.',
          'Efficiency',
          'Q (Total Product)',
          'Q (Good Product)',
          'Q (Defect Product)',
          'Status',
          'Speed Losses',
          'OEE%',
          'A%',
          'P%',
          'Q%',
          ...mcParamAs.map((item) => item.name),
          ...mcParamPs.map((item) => item.name),
          ...mcParamQs.map((item) => item.name),
        ],
      ],
      { origin: 'A1' },
    );
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Logs');

    const buf = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    res.set({
      'Content-Type': 'application/vnd.ms-excel',
      'Content-Disposition': `attachment; filename="oee-batch-${id}-logs.xlsx"`,
    });

    return new StreamableFile(buf);
  }

  @Post(':id/open-edit')
  createOpenEditHistory(
    @Param('id') id: number,
    @Body() createDto: OeeBatchHistoryEdit,
  ): Promise<OeeBatchEditHistoryEntity> {
    return this.oeeBatchService.createBatchHistory(id, OEE_BATCH_HISTORY_TYPE_EDIT, createDto);
  }

  @Get(':id/timelines')
  getOeeBatchTimelines(@Param('id') id: string): Promise<OeeBatchStatsTimelineEntity[]> {
    const batchId = Number(id);
    return this.oeeBatchService.findBatchTimelinesByBatchId(batchId);
  }

  @Get(':id/oee-stats')
  getOeeBatchStatsTime(
    @Param('id') id: string,
    @Query('samplingSeconds') samplingSeconds: string,
  ): Promise<OeeBatchStatsEntity[]> {
    const batchId = Number(id);
    return this.oeeBatchService.findBatchStatsByBatchId(batchId, Number(samplingSeconds));
  }

  @Get(':id/a-pareto')
  getAPareto(@Param('id') id: string): Promise<ParetoData> {
    const batchId = Number(id);
    return this.oeeBatchService.calculateBatchParetoA(batchId);
  }

  @Get(':id/p-pareto')
  getPPareto(@Param('id') id: string): Promise<ParetoData> {
    const batchId = Number(id);
    return this.oeeBatchService.calculateBatchParetoP(batchId);
  }

  @Get(':id/q-pareto')
  getQPareto(@Param('id') id: string): Promise<ParetoData> {
    const batchId = Number(id);
    return this.oeeBatchService.calculateBatchParetoQ(batchId);
  }
}
