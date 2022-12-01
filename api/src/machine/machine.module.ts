import { Module } from '@nestjs/common';
import { ContentModule } from '../common/content/content.module';
import { MachineService } from './machine.service';
import { MachineController } from './machine.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MachineParameter } from '../common/entities/machine-parameter';
import { Machine } from '../common/entities/machine';
import { Site } from '../common/entities/site';
import { Widget } from '../common/entities/widget';

@Module({
  imports: [ContentModule, TypeOrmModule.forFeature([Machine, MachineParameter, Widget, Site])],
  controllers: [MachineController],
  providers: [MachineService],
})
export class MachineModule {}
