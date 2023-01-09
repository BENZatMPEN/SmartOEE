import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { IdListDto } from '../common/dto/id-list.dto';
import { PlanningService } from './planning.service';
import { CreatePlanningDto } from './dto/create-planning.dto';
import { UpdatePlanningDto } from './dto/update-planning.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ReqDec } from '../common/decorators/req-dec';
import { SiteIdPipe } from '../common/pipe/site-id.pipe';
import { SiteEntity } from '../common/entities/site-entity';
import { PlanningEntity } from '../common/entities/planning-entity';

@UseGuards(JwtAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
@Controller('plannings')
export class PlanningController {
  constructor(private readonly planningService: PlanningService) {}

  @Get()
  findAll(
    @ReqDec(SiteIdPipe) siteId: number,
    @Query('start') start: Date,
    @Query('end') end: Date,
  ): Promise<PlanningEntity[]> {
    return this.planningService.findByDateRange(siteId, start || new Date(), end || new Date());
  }

  @Get(':id')
  async findById(@Param('id') id: number, @ReqDec(SiteIdPipe) siteId: number): Promise<PlanningEntity> {
    const planning = await this.planningService.findById(id, siteId);
    if (!planning) {
      throw new NotFoundException();
    }

    return planning;
  }

  @Post()
  create(
    @Body() createDto: CreatePlanningDto,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @ReqDec(SiteIdPipe) siteId: number,
  ): Promise<PlanningEntity> {
    return this.planningService.create(createDto);
  }

  @Put(':id')
  update(
    @Param('id') id: number,
    @Body() updateDto: UpdatePlanningDto,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @ReqDec(SiteIdPipe) siteId: number,
  ): Promise<PlanningEntity> {
    return this.planningService.update(id, updateDto);
  }

  @Delete(':id')
  async delete(
    @Param('id') id: number,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @ReqDec(SiteIdPipe) siteId: number,
  ): Promise<void> {
    await this.planningService.delete(id);
  }

  @Delete()
  async deleteMany(
    @Query() dto: IdListDto,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @ReqDec(SiteIdPipe) siteId: number,
  ): Promise<void> {
    await this.planningService.deleteMany(dto.ids);
  }
}
