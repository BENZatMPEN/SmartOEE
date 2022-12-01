import { Module } from '@nestjs/common';
import { DeviceModelService } from './device-model.service';
import { DeviceModelController } from './device-model.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeviceModel } from '../common/entities/device-model';
import { DeviceModelTag } from '../common/entities/device-model-tag';
import { SiteIdPipe } from '../common/pipe/site-id-pipe.service';
import { Site } from '../common/entities/site';
import { DeviceTag } from '../common/entities/device-tag';
import { Device } from '../common/entities/device';

@Module({
  imports: [TypeOrmModule.forFeature([DeviceModel, DeviceModelTag, Device, DeviceTag, Site])],
  controllers: [DeviceModelController],
  providers: [DeviceModelService, SiteIdPipe],
})
export class DeviceModelModule {}
