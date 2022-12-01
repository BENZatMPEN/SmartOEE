import { Module } from '@nestjs/common';
import { ContentModule } from '../common/content/content.module';
import { SiteService } from './site.service';
import { SiteController } from './site.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Site } from '../common/entities/site';
import { User } from '../common/entities/user';

@Module({
  imports: [ContentModule, TypeOrmModule.forFeature([Site, User])],
  controllers: [SiteController],
  providers: [SiteService],
})
export class SiteModule {}
