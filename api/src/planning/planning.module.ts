import { Module } from '@nestjs/common';
import { PlanningService } from './planning.service';
import { PlanningController } from './planning.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SiteEntity } from '../common/entities/site-entity';
import { PlanningEntity } from '../common/entities/planning-entity';

@Module({
  imports: [TypeOrmModule.forFeature([PlanningEntity, SiteEntity])],
  controllers: [PlanningController],
  providers: [PlanningService],
})
export class PlanningModule {}
