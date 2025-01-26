import { Module } from '@nestjs/common';
import { OeeService } from './oee.service';
import { OeeController } from './oee.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OeeEntity } from '../common/entities/oee.entity';
import { OeeProductEntity } from '../common/entities/oee-product.entity';
import { OeeMachineEntity } from '../common/entities/oee-machine.entity';
import { SiteEntity } from '../common/entities/site.entity';
import { OeeBatchEntity } from '../common/entities/oee-batch.entity';
import { FileService } from '../common/services/file.service';
import { PlanningEntity } from '../common/entities/planning.entity';
import { OeeMachinePlannedDowntimeEntity } from 'src/common/entities/oee-machine-planned-downtime.entity';
import { UserEntity } from 'src/common/entities/user.entity';
import { OeeBatchPlannedDowntimeEntity } from 'src/common/entities/oee-batch-planned-downtime.entity';
import { WorkShiftEntity } from 'src/common/entities/work-shift.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      OeeEntity,
      OeeProductEntity,
      OeeMachineEntity,
      OeeBatchEntity,
      SiteEntity,
      PlanningEntity,
      OeeMachinePlannedDowntimeEntity,
      UserEntity,
      OeeBatchPlannedDowntimeEntity,
      WorkShiftEntity
    ]),
  ],
  controllers: [OeeController],
  providers: [OeeService, FileService],
})
export class OeeModule {}
