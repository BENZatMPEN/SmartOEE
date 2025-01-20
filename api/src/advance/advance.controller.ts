import { ClassSerializerInterceptor, Controller, Get, Query, UseGuards, UseInterceptors } from "@nestjs/common";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";
import { AdvanceService } from "./advance.service";
import { OeeStatus } from "src/common/type/oee-status";


@UseGuards(JwtAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
@Controller('api/advances')
export class AdvanceController {
    constructor(private readonly advanceService: AdvanceService) { }

    @Get('oee/mode1')
    findAll(
        @Query('siteId') siteId: number,
        @Query('startDate') startDate: string,
        @Query('endDate') endDate: string,
        @Query('userId') userId: number,
        @Query('isStream') isStream: boolean
    ): Promise<OeeStatus> {
        return this.advanceService.findAll(siteId, startDate, endDate, userId,isStream);
    }

}