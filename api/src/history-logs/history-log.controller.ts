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
import { HistoryLogEntity } from '../common/entities/history-log.entity';
import { Response } from 'express';
import * as XLSX from 'xlsx';
import dayjs from 'dayjs';

@UseGuards(JwtAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
@Controller('api/history-logs')
export class HistoryLogController {
  constructor(private readonly historyLogService: HistoryLogService) {}

  @Get()
  findFilter(@Query() filterDto: FilterHistoryLogDto): Promise<PagedLisDto<HistoryLogEntity>> {
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
        ...{
          date: dayjs(item.createdAt).format('DD/MM/YYYY'),
          time: dayjs(item.createdAt).format('HH:mm'),
          message: item.message,
        },
        ...(filterDto.type === 'action' ? { user: `${item.user?.firstName} ${item.user?.lastName}` } : undefined),
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.sheet_add_aoa(
      worksheet,
      filterDto.type === 'action' ? [['Date', 'Time', 'Message', 'User']] : [['Date', 'Time', 'Message']],
      { origin: 'A1' },
    );
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Logs');

    const buf = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    res.set({
      'Content-Type': 'application/vnd.ms-excel',
      'Content-Disposition': `attachment; filename="history-logs.xlsx"`,
    });

    return new StreamableFile(buf);
  }
}
