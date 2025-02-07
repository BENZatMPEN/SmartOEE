import { ClassSerializerInterceptor, Controller, Get, Query, UseGuards, UseInterceptors } from "@nestjs/common";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";
import { AdvanceService } from "./advance.service";
import { OeeStatus } from "src/common/type/oee-status";
import { AdvanceDto } from "./dto/advance.dto";


@UseGuards(JwtAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
@Controller('api/advances')
export class AdvanceController {
    constructor(private readonly advanceService: AdvanceService) { }

    @Get('oee/mode1')
    findAllOeeMode1(@Query() advanceDto: AdvanceDto, @Query('siteId') siteId: number): Promise<OeeStatus> {
        return this.advanceService.findAllOeeMode1(advanceDto, siteId);
    }

    
    @Get('oee/mode2')
    findAllOeeMode2(@Query() advanceDto: AdvanceDto, @Query('siteId') siteId: number): Promise<OeeStatus> {
        return this.advanceService.findAllOeeMode2(advanceDto, siteId);
    }
}