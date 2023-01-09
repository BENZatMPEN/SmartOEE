import { Module } from '@nestjs/common';
import { DeviceModelService } from './device-model.service';
import { DeviceModelController } from './device-model.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeviceModelEntity } from '../common/entities/device-model-entity';
import { DeviceModelTagEntity } from '../common/entities/device-model-tag-entity';
import { SiteEntity } from '../common/entities/site-entity';
import { DeviceTagEntity } from '../common/entities/device-tag-entity';
import { DeviceEntity } from '../common/entities/device-entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([DeviceModelEntity, DeviceModelTagEntity, DeviceEntity, DeviceTagEntity, SiteEntity]),
  ],
  controllers: [DeviceModelController],
  providers: [DeviceModelService],
})
export class DeviceModelModule {}
