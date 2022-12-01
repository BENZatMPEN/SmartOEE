import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from '../../configuration';
import { ContentService } from './content.service';

@Module({
  imports: [ConfigModule.forFeature(configuration)],
  providers: [ContentService],
  exports: [ContentService],
})
export class ContentModule {}
