import { Module } from '@nestjs/common';
import { MachineService } from './machine.service';
import { MachineController } from './machine.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MachineParameterEntity } from '../common/entities/machine-parameter-entity';
import { MachineEntity } from '../common/entities/machine-entity';
import { SiteEntity } from '../common/entities/site-entity';
import { WidgetEntity } from '../common/entities/widget-entity';
import { FileService } from '../common/services/file.service';

@Module({
  imports: [TypeOrmModule.forFeature([MachineEntity, MachineParameterEntity, WidgetEntity, SiteEntity])],
  controllers: [MachineController],
  providers: [MachineService, FileService],
})
export class MachineModule {}
