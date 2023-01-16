import { Module } from '@nestjs/common';
import { EventGateway } from './event.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TagReadEntity } from '../common/entities/tag-read-entity';
import { WsStrategy } from '../auth/ws.strategy';
import { ConfigModule } from '@nestjs/config';
import configuration from '../configuration';
import { SiteEntity } from '../common/entities/site-entity';
import { UserEntity } from '../common/entities/user-entity';
import { RoleEntity } from '../common/entities/role-entity';
import { UserService } from '../user/user.service';
import { FileService } from '../common/services/file.service';

@Module({
  imports: [
    ConfigModule.forFeature(configuration),
    TypeOrmModule.forFeature([SiteEntity, UserEntity, RoleEntity, TagReadEntity]),
  ],
  providers: [EventGateway, WsStrategy, UserService, FileService],
})
export class EventModule {}
