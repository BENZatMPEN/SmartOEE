import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { AnalyticService } from './analytic.service';
import { CreateAnalyticDto } from './dto/create-analytic.dto';
import { UpdateAnalyticDto } from './dto/update-analytic.dto';
import { Analytic } from '../common/entities/analytic';
import { ReqDec } from '../common/decorator/req-dec';
import { SiteIdPipe } from '../common/pipe/site-id-pipe.service';
import { Site } from '../common/entities/site';
import { ChartFilterDto } from './dto/chart-filter-dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// @UseGuards(JwtAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
@Controller('analytics')
export class AnalyticController {
  constructor(
    private readonly analyticService: AnalyticService,
    @InjectRepository(Site)
    private readonly siteRepository: Repository<Site>,
  ) {}

  @Get('oee')
  async findOee(@ReqDec(SiteIdPipe) siteId: number, @Query() requestDto: ChartFilterDto): Promise<any> {
    const { viewType, duration, type, ids, from, to } = requestDto;
    const objectIds = (ids || []).map((id) => Number(id));
    const fromDate = new Date(from);
    const toDate = new Date(to);

    if (objectIds.length === 0) {
      return {
        rows: [],
        sumRows: [],
      };
    }

    if (viewType === 'object') {
      return await this.analyticService.findOeeByObject(siteId, type, objectIds, duration, fromDate, toDate);
    } else if (viewType === 'time') {
      return await this.analyticService.findOeeByTime(siteId, type, objectIds, duration, fromDate, toDate);
    } else {
      return {
        rows: [],
        sumRows: [],
      };
    }
  }

  @Get('mc')
  async findMc(@ReqDec(SiteIdPipe) siteId: number, @Query() requestDto: ChartFilterDto): Promise<any> {
    const { viewType, duration, type, ids, from, to } = requestDto;
    const objectIds = (ids || []).map((id) => Number(id));
    const fromDate = new Date(from);
    const toDate = new Date(to);

    if (objectIds.length === 0) {
      return {
        rows: [],
        sumRows: [],
      };
    }

    if (viewType === 'object') {
      return await this.analyticService.findMcByObject(siteId, type, objectIds, duration, fromDate, toDate);
    } else if (viewType === 'time') {
      return await this.analyticService.findMcByTime(siteId, type, objectIds, duration, fromDate, toDate);
    } else {
      return {
        rows: [],
        sumRows: [],
      };
    }
  }

  @Get(':id')
  findById(@Param('id') id: number, @ReqDec(SiteIdPipe) siteId: number): Promise<Analytic> {
    return this.analyticService.findById(id, siteId);
  }

  @Post()
  create(
    @Body() createDto: CreateAnalyticDto,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @ReqDec(SiteIdPipe) siteId: number,
  ): Promise<Analytic> {
    return this.analyticService.create(createDto);
  }

  @Put(':id')
  update(
    @Param('id') id: number,
    @Body() updateDto: UpdateAnalyticDto,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @ReqDec(SiteIdPipe) siteId: number,
  ): Promise<Analytic> {
    return this.analyticService.update(id, updateDto);
  }

  @Delete(':id')
  async delete(
    @Param('id') id: number,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @ReqDec(SiteIdPipe) siteId: number,
  ): Promise<void> {
    await this.analyticService.delete(id);
  }

  @Get()
  findAll(@ReqDec(SiteIdPipe) siteId: number, @Query('group') group: string): Promise<Analytic[]> {
    return this.analyticService.findAll(group === 'true', siteId);
  }

  // @Get('oee-time')
  // async findOeeTime(@ReqDec(SiteIdPipe) siteId: number, @Query() requestDto: ChartFilterDto): Promise<any> {
  //   const site = await this.siteRepository.findOneBy({ id: siteId });
  //   const cutoff = dayjs(site.cutoffTime);
  //   const cutoffHour = cutoff.hour();
  //   const cutoffMin = cutoff.minute();
  //   const fromDate = dayjs(new Date(requestDto.from)).hour(cutoffHour).minute(cutoffMin).toDate();
  //   const toDate = dayjs(new Date(requestDto.to)).hour(cutoffHour).minute(cutoffMin).toDate();
  //
  //   return this.analyticService.findOeeByTime(
  //     requestDto.type,
  //     requestDto.id.map((item) => Number(item)),
  //     requestDto.duration,
  //     fromDate,
  //     toDate,
  //   );
  //
  //   // if (requestDto.type === 'oee') {
  //   //   const oeeId = Number(requestDto.id[0]);
  //   //   return this.analyticService.findOeeTimeByOeeIdAndDuration(oeeId, requestDto.duration, fromDate, toDate);
  //   // } else if (requestDto.type === 'product') {
  //   //   const productId = Number(requestDto.id[0]);
  //   //   return this.analyticService.findOeeTimeByProductIdAndDuration(productId, requestDto.duration, fromDate, toDate);
  //   // } else if (requestDto.type === 'batch') {
  //   //   const batchId = Number(requestDto.id[0]);
  //   //   return this.analyticService.findOeeTimeByOeeBatchIdAndDuration(batchId, requestDto.duration, fromDate, toDate);
  //   // }
  // }
  //
  // @Get('oee')
  // async findOee(@ReqDec(SiteIdPipe) siteId: number, @Query() requestDto: ChartFilterDto): Promise<any> {
  //   const site = await this.siteRepository.findOneBy({ id: siteId });
  //   const cutoff = dayjs(site.cutoffTime);
  //   const cutoffHour = cutoff.hour();
  //   const cutoffMin = cutoff.minute();
  //   const fromDate = dayjs(new Date(requestDto.from)).hour(cutoffHour).minute(cutoffMin).toDate();
  //   const toDate = dayjs(new Date(requestDto.to)).hour(cutoffHour).minute(cutoffMin).toDate();
  //
  //   return this.analyticService.findOeeByObject(
  //     requestDto.type,
  //     requestDto.id.map((item) => Number(item)),
  //     requestDto.duration,
  //     fromDate,
  //     toDate,
  //   );
  //
  //   // const fromDate = new Date(requestDto.from);
  //   // const toDate = new Date(requestDto.to);
  //   //
  //   // if (requestDto.type === 'oee') {
  //   //   const oeeId = Number(requestDto.id);
  //   //   return this.analyticService.findOeeByOeeId(oeeId, fromDate, toDate);
  //   // } else if (requestDto.type === 'product') {
  //   //   const productId = Number(requestDto.id);
  //   //   return this.analyticService.findOeeByProductId(productId, fromDate, toDate);
  //   // } else if (requestDto.type === 'batch') {
  //   //   const batchId = Number(requestDto.id);
  //   //   return this.analyticService.findOeeByOeeBatchId(batchId, fromDate, toDate);
  //   // }
  // }
}
