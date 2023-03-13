import { Module } from '@nestjs/common';
import { SiteService } from './site.service';
import { SiteController } from './site.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SiteEntity } from '../common/entities/site.entity';
import { FileService } from '../common/services/file.service';
import { UserEntity } from '../common/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SiteEntity, UserEntity])],
  controllers: [SiteController],
  providers: [SiteService, FileService],
})
export class SiteModule {}
