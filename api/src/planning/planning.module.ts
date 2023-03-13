import { Module } from '@nestjs/common';
import { PlanningService } from './planning.service';
import { PlanningController } from './planning.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlanningEntity } from '../common/entities/planning.entity';
import { OeeService } from '../oee/oee.service';
import { ProductService } from '../product/product.service';
import { UserService } from '../user/user.service';
import { UserEntity } from '../common/entities/user.entity';
import { ProductEntity } from '../common/entities/product.entity';
import { OeeEntity } from '../common/entities/oee.entity';
import { SiteEntity } from '../common/entities/site.entity';
import { OeeMachineEntity } from '../common/entities/oee-machine.entity';
import { OeeProductEntity } from '../common/entities/oee-product.entity';
import { OeeBatchEntity } from '../common/entities/oee-batch.entity';
import { FileService } from '../common/services/file.service';
import { RoleEntity } from '../common/entities/role.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PlanningEntity,
      OeeEntity,
      ProductEntity,
      UserEntity,
      RoleEntity,
      SiteEntity,
      OeeMachineEntity,
      OeeProductEntity,
      OeeBatchEntity,
    ]),
  ],
  controllers: [PlanningController],
  providers: [PlanningService, OeeService, ProductService, UserService, FileService],
})
export class PlanningModule {}
