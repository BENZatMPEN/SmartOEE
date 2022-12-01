import { Module } from '@nestjs/common';
import { PlanningService } from './planning.service';
import { PlanningController } from './planning.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Site } from '../common/entities/site';
import { Planning } from '../common/entities/planning';

@Module({
  imports: [TypeOrmModule.forFeature([Planning, Site])],
  controllers: [PlanningController],
  providers: [PlanningService],
})
export class PlanningModule {}
