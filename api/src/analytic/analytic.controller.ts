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
import { AnalyticEntity } from '../common/entities/analytic.entity';
import { ChartFilterDto } from './dto/chart-filter-dto';

// @UseGuards(JwtAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
@Controller('api/oee-analytics')
export class AnalyticController {
  constructor(private readonly analyticService: AnalyticService) {}

  @Get('oee')
  async findOee(@Query() requestDto: ChartFilterDto, @Query('siteId') siteId: number): Promise<any> {
    const { viewType, duration, type, ids, from, to } = requestDto;
    if ((ids || []).length === 0) {
      return {
        rows: [],
        sumRows: [],
      };
    }

    if (viewType === 'object') {
      return await this.analyticService.findOeeByObject(siteId, type, ids, from, to);
    } else if (viewType === 'time') {
      return await this.analyticService.findOeeByTime(siteId, type, ids, duration, from, to);
    } else {
      return {
        rows: [],
        sumRows: [],
      };
    }
  }

  @Get('mc')
  async findMc(@Query() requestDto: ChartFilterDto, @Query('siteId') siteId: number): Promise<any> {
    const { viewType, duration, type, ids, from, to } = requestDto;
    if ((ids || []).length === 0) {
      return {
        sumRows: [],
      };
    }

    if (viewType === 'object') {
      return await this.analyticService.findMcByObject(siteId, type, ids, from, to);
    } else if (viewType === 'time') {
      return await this.analyticService.findMcByTime(siteId, type, ids, duration, from, to);
    }

    return {
      sumRows: [],
    };
  }

  @Get('aParam')
  async findAPareto(@Query() requestDto: ChartFilterDto, @Query('siteId') siteId: number): Promise<any> {
    const { viewType, duration, type, ids, from, to } = requestDto;
    if ((ids || []).length === 0) {
      return {
        rows: [],
        sumRows: [],
      };
    }

    if (viewType === 'object') {
      // pareto
      return await this.analyticService.findAPareto(type, ids, from, to);
    } else if (viewType === 'time') {
      // pie
      return await this.analyticService.findAParams(siteId, type, ids, duration, from, to);
    }

    return {
      rows: [],
      sumRows: [],
    };
  }

  @Get('pParam')
  async findPPareto(@Query() requestDto: ChartFilterDto, @Query('siteId') siteId: number): Promise<any> {
    const { viewType, duration, type, ids, from, to } = requestDto;
    if ((ids || []).length === 0) {
      return {
        rows: [],
        sumRows: [],
      };
    }

    if (viewType === 'object') {
      // pareto
      return await this.analyticService.findPPareto(type, ids, from, to);
    } else if (viewType === 'time') {
      // pie
      return await this.analyticService.findPParams(siteId, type, ids, duration, from, to);
    }

    return {
      rows: [],
      sumRows: [],
    };
  }

  @Get('qParam')
  async findQPareto(@Query() requestDto: ChartFilterDto, @Query('siteId') siteId: number): Promise<any> {
    const { viewType, duration, type, ids, from, to } = requestDto;
    if ((ids || []).length === 0) {
      return {
        rows: [],
        sumRows: [],
      };
    }

    if (viewType === 'object') {
      // pareto
      return await this.analyticService.findQPareto(type, ids, from, to);
    } else if (viewType === 'time') {
      // pie
      return await this.analyticService.findQParams(siteId, type, ids, duration, from, to);
    }

    return {
      rows: [],
      sumRows: [],
    };
  }

  @Get(':id')
  findById(@Param('id') id: number, @Query('siteId') siteId: number): Promise<AnalyticEntity> {
    return this.analyticService.findById(id, siteId);
  }

  @Post()
  create(@Body() createDto: CreateAnalyticDto, @Query('siteId') siteId: number): Promise<AnalyticEntity> {
    return this.analyticService.create(createDto, siteId);
  }

  @Put(':id')
  update(
    @Param('id') id: number,
    @Body() updateDto: UpdateAnalyticDto,
    @Query('siteId') siteId: number,
  ): Promise<AnalyticEntity> {
    return this.analyticService.update(id, updateDto, siteId);
  }

  @Delete(':id')
  async delete(@Param('id') id: number, @Query('siteId') siteId: number): Promise<void> {
    await this.analyticService.delete(id, siteId);
  }

  @Get()
  findAll(@Query('group') group: string, @Query('siteId') siteId: number): Promise<AnalyticEntity[]> {
    return this.analyticService.findAll(group === 'true', siteId);
  }
}
