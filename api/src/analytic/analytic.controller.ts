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
import { ChartFilterDto } from './dto/chart-filter-dto';

// @UseGuards(JwtAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
@Controller('analytics')
export class AnalyticController {
  constructor(private readonly analyticService: AnalyticService) {}

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
      return await this.analyticService.findOeeByObject(siteId, type, objectIds, fromDate, toDate);
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
      return await this.analyticService.findMcByObject(siteId, type, objectIds, fromDate, toDate);
    } else if (viewType === 'time') {
      return await this.analyticService.findMcByTime(siteId, type, objectIds, duration, fromDate, toDate);
    }

    return {
      rows: [],
      sumRows: [],
    };
  }

  @Get('aParam')
  async findAPareto(@ReqDec(SiteIdPipe) siteId: number, @Query() requestDto: ChartFilterDto): Promise<any> {
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
      // pareto
      return await this.analyticService.findAPareto(type, objectIds, fromDate, toDate);
    } else if (viewType === 'time') {
      // pie
      return await this.analyticService.findAParams(siteId, type, objectIds, duration, fromDate, toDate);
    }

    return {
      rows: [],
      sumRows: [],
    };
  }

  @Get('pParam')
  async findPPareto(@ReqDec(SiteIdPipe) siteId: number, @Query() requestDto: ChartFilterDto): Promise<any> {
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
      // pareto
      return await this.analyticService.findPPareto(type, objectIds, fromDate, toDate);
    } else if (viewType === 'time') {
      // pie
      return await this.analyticService.findPParams(siteId, type, objectIds, duration, fromDate, toDate);
    }

    return {
      rows: [],
      sumRows: [],
    };
  }

  @Get('qParam')
  async findQPareto(@ReqDec(SiteIdPipe) siteId: number, @Query() requestDto: ChartFilterDto): Promise<any> {
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
      // pareto
      return await this.analyticService.findQPareto(type, objectIds, fromDate, toDate);
    } else if (viewType === 'time') {
      // pie
      return await this.analyticService.findQParams(siteId, type, objectIds, duration, fromDate, toDate);
    }

    return {
      rows: [],
      sumRows: [],
    };
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
}
