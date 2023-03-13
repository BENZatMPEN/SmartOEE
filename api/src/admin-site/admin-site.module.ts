import { Module } from '@nestjs/common';
import { AdminSiteService } from './admin-site.service';
import { AdminSiteController } from './admin-site.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SiteEntity } from '../common/entities/site.entity';
import { FileService } from '../common/services/file.service';

@Module({
  imports: [TypeOrmModule.forFeature([SiteEntity])],
  controllers: [AdminSiteController],
  providers: [AdminSiteService, FileService],
})
export class AdminSiteModule {}
