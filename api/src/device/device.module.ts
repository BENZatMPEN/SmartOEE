import { Module } from '@nestjs/common';
import { DeviceService } from './device.service';
import { DeviceController } from './device.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Device } from '../common/entities/device';
import { DeviceTag } from '../common/entities/device-tag';
import { Site } from '../common/entities/site';

@Module({
  imports: [TypeOrmModule.forFeature([Device, DeviceTag, Site])],
  controllers: [DeviceController],
  providers: [DeviceService],
})
export class DeviceModule {}
