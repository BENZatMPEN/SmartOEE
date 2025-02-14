import { Body, ClassSerializerInterceptor, Controller, Get, Put, Query, UseGuards, UseInterceptors } from "@nestjs/common";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";
import { AdvanceService } from "./advance.service";
import { OeeStatus } from "src/common/type/oee-status";
import { AdvanceDto } from "./dto/advance.dto";
import { AndonColumnDto } from "./dto/andonDto-column.dto";


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

    // @Get('teep/mode1')
    // findAllTeepMode1(@Query() advanceDto: AdvanceDto, @Query('siteId') siteId: number): Promise<OeeStatus> {
    //     return this.advanceService.findAllTeepMode1(advanceDto, siteId);
    // }

    // @Get('andons/all')
    // findAllAndons(@Query() advanceDto: AdvanceDto, @Query('siteId') siteId: number): Promise<any> {
    //     return this.advanceService.findAllAndons(advanceDto, siteId);
    // }

    // @Get('andons/columns')
    // findAllAndonsColumns(@Query('siteId') siteId: number): Promise<any> {
    //     return this.advanceService.findAllAndonsColumns(siteId);
    // }

    // @Put('andons')
    // updateAndons(@Body() andonColumnDto: AndonColumnDto): Promise<any> {
    //     return this.advanceService.updateAndons(andonColumnDto);
    // }
}