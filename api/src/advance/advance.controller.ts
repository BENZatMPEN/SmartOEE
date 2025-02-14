import { Body, ClassSerializerInterceptor, Controller, Get, Put, Query, UseGuards, UseInterceptors } from "@nestjs/common";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";
import { AdvanceService } from "./advance.service";
import { OeeStatus } from "src/common/type/oee-status";
import { AdvanceReqDto } from "./dto/advance-req.dto";
import { AndonUpdateColumnReqDto } from "./dto/andon-column-req.dto";
import { AndonResDto } from "./dto/andon-res.dto";
import { AndonColumnEntity } from "src/common/entities/andon-column.entity";


@UseGuards(JwtAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
@Controller('api/advances')
export class AdvanceController {
    constructor(private readonly advanceService: AdvanceService) { }

    @Get('oee/mode1')
    findAllOeeMode1(@Query() advanceDto: AdvanceReqDto, @Query('siteId') siteId: number): Promise<OeeStatus> {
        return this.advanceService.findAllOeeMode1(advanceDto, siteId);
    }
    
    @Get('oee/mode2')
    findAllOeeMode2(@Query() advanceDto: AdvanceReqDto, @Query('siteId') siteId: number): Promise<OeeStatus> {
        return this.advanceService.findAllOeeMode2(advanceDto, siteId);
    }

    // @Get('teep/mode1')
    // findAllTeepMode1(@Query() advanceDto: AdvanceDto, @Query('siteId') siteId: number): Promise<OeeStatus> {
    //     return this.advanceService.findAllTeepMode1(advanceDto, siteId);
    // }

    @Get('andons/all')
    findAllAndons(@Query() advanceDto: AdvanceReqDto, @Query('siteId') siteId: number): Promise<AndonResDto> {
        return this.advanceService.findAllAndons(advanceDto, siteId);
    }

    @Put('andons')
    updateAndons(@Body() andonColumnDto: AndonUpdateColumnReqDto): Promise<AndonColumnEntity[]> {
        return this.advanceService.updateAndons(andonColumnDto);
    }
}