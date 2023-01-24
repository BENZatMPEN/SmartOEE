import { Module } from '@nestjs/common';
import { PlanningService } from './planning.service';
import { PlanningController } from './planning.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlanningEntity } from '../common/entities/planning-entity';

@Module({
  imports: [TypeOrmModule.forFeature([PlanningEntity])],
  controllers: [PlanningController],
  providers: [PlanningService],
})
export class PlanningModule {}
