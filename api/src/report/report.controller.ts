import { ClassSerializerInterceptor, Controller, Get, Query, UseInterceptors } from "@nestjs/common";
import { ReportService } from "./report.service";
import { QueryReportOeeDto } from "./dto/report.dto";


@UseInterceptors(ClassSerializerInterceptor)
@Controller('api/reports')
export class ReportController {
    constructor(private readonly reportService: ReportService){}

    @Get('oee')
    async findOee(@Query() query: QueryReportOeeDto): Promise<any> {
        return await this.reportService.findOeeByTime(query);
    }

    @Get('cause')
    async findCause(@Query() query: QueryReportOeeDto): Promise<any> {
        return await this.reportService.findCauseByTime(query);
    }
}