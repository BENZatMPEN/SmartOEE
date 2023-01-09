import { Module } from '@nestjs/common';
import { SiteService } from './site.service';
import { SiteController } from './site.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SiteEntity } from '../common/entities/site-entity';
import { FileService } from '../common/services/file.service';
import { UserSiteRoleEntity } from '../common/entities/user-site-role-entity';

@Module({
  imports: [TypeOrmModule.forFeature([SiteEntity, UserSiteRoleEntity])],
  controllers: [SiteController],
  providers: [SiteService, FileService],
})
export class SiteModule {}
