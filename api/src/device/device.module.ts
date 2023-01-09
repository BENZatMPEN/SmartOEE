import { Module } from '@nestjs/common';
import { DeviceService } from './device.service';
import { DeviceController } from './device.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeviceEntity } from '../common/entities/device-entity';
import { DeviceTagEntity } from '../common/entities/device-tag-entity';
import { SiteEntity } from '../common/entities/site-entity';

@Module({
  imports: [TypeOrmModule.forFeature([DeviceEntity, DeviceTagEntity, SiteEntity])],
  controllers: [DeviceController],
  providers: [DeviceService],
})
export class DeviceModule {}
