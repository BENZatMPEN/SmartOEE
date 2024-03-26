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
import { UserEntity } from 'src/common/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      OeeEntity,
      OeeProductEntity,
      OeeMachineEntity,
      OeeBatchEntity,
      SiteEntity,
      PlanningEntity,
      UserEntity,
    ]),
  ],
  controllers: [OeeController],
  providers: [OeeService, FileService],
})
export class OeeModule {}
