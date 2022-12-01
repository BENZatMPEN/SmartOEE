import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  Query,
  Res,
  StreamableFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { PagedLisDto } from '../common/dto/paged-list.dto';
import { HistoryLogService } from './history-log.service';
import { FilterHistoryLogDto } from './dto/filter-history-log.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ReqDec } from '../common/decorator/req-dec';
import { SiteIdPipe } from '../common/pipe/site-id-pipe.service';
import { Site } from '../common/entities/site';
import { HistoryLog } from '../common/entities/history-log';
import { Response } from 'express';
import * as XLSX from 'xlsx';
import * as dayjs from 'dayjs';

@UseGuards(JwtAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
@Controller('history-logs')
export class HistoryLogController {
  constructor(private readonly historyLogService: HistoryLogService) {}

  @Get()
  findFilter(
    @Query() filterDto: FilterHistoryLogDto,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @ReqDec(SiteIdPipe) siteId: number,
  ): Promise<PagedLisDto<HistoryLog>> {
    return this.historyLogService.findPagedList(filterDto);
  }

  @Get('export')
  async export(
    @Query() filterDto: FilterHistoryLogDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const logs = await this.historyLogService.findList(filterDto);
    const rows = logs.map((item) => {
      return {
        date: dayjs(item.createdAt).format('DD/MM/YYYY'),
        time: dayjs(item.createdAt).format('HH:mm'),
        message: item.message,
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.sheet_add_aoa(worksheet, [['Date', 'Time', 'Message']], { origin: 'A1' });
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Logs');

    const buf = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    res.set({
      'Content-Type': 'application/vnd.ms-excel',
      'Content-Disposition': `attachment; filename="history-logs.xlsx"`,
    });

    return new StreamableFile(buf);
  }

  // @Get('all')
  // findAll(@ReqDec(SitePipe) site: Site): Promise<Alarm[]> {
  //   return this.alarmService.findAll(site.id);
  // }

  // @Get(':id')
  // async findById(@Param('id') id: number, @ReqDec(SitePipe) site: Site): Promise<Alarm> {
  //   const alarm = await this.alarmService.findById(id, site.id);
  //   if (!alarm) {
  //     throw new NotFoundException();
  //   }
  //
  //   return alarm;
  // }
}
