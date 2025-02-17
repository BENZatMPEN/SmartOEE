import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Put,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { AdvanceService } from './advance.service';
import { OeeStatus } from 'src/common/type/oee-status';
import { AdvanceOee } from './dto/advance-oee.dto';
import { AndonUpdateColumn } from './dto/andon-update-column.dto';
import { AndonColumnEntity } from 'src/common/entities/andon-column.entity';
import { AdvanceTeep } from './dto/advance-teep.dto';
import { AndonResponse } from './dto/andon-response.dto';

@UseGuards(JwtAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
@Controller('api/advances')
export class AdvanceController {
  constructor(private readonly advanceService: AdvanceService) {}

  @Get('oee/mode1')
  findAllOeeMode1(@Query() advanceDto: AdvanceOee, @Query('siteId') siteId: number): Promise<OeeStatus> {
    return this.advanceService.findAllOeeMode1(advanceDto, siteId);
  }

  @Get('oee/mode2')
  findAllOeeMode2(@Query() advanceDto: AdvanceOee, @Query('siteId') siteId: number): Promise<OeeStatus> {
    return this.advanceService.findAllOeeMode2(advanceDto, siteId);
  }

  @Get('teep/mode1')
  findAllTeepMode1(@Query() advanceDto: AdvanceTeep, @Query('siteId') siteId: number): Promise<OeeStatus> {
    return this.advanceService.findAllTeepMode1(advanceDto, siteId);
  }

  @Get('teep/mode2')
  findAllTeepMode2(@Query() advanceDto: AdvanceTeep, @Query('siteId') siteId: number): Promise<OeeStatus> {
    return this.advanceService.findAllTeepMode2(advanceDto, siteId);
  }

  @Get('andons/all')
  findAllAndons(@Query() advanceDto: AdvanceOee, @Query('siteId') siteId: number): Promise<AndonResponse> {
    return this.advanceService.findAllAndons(advanceDto, siteId);
  }

  @Put('andons')
  updateAndons(@Body() andonColumnDto: AndonUpdateColumn): Promise<AndonColumnEntity[]> {
    return this.advanceService.updateAndons(andonColumnDto);
  }
}
