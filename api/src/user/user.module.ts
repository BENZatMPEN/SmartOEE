import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserEntity } from '../common/entities/user-entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleEntity } from '../common/entities/role-entity';
import { SiteEntity } from '../common/entities/site-entity';
import { CaslModule } from '../casl/casl.module';
import { UserSiteRoleEntity } from '../common/entities/user-site-role-entity';
import { AuthService } from '../auth/auth.service';
import { LogService } from '../common/services/log.service';
import { JwtService } from '@nestjs/jwt';
import { HistoryLogEntity } from '../common/entities/history-log-entity';
import { FileService } from '../common/services/file.service';
import { EmailExistsRule } from '../common/validations/email-exists.validator';

@Module({
  imports: [
    CaslModule,
    TypeOrmModule.forFeature([UserEntity, RoleEntity, SiteEntity, HistoryLogEntity, UserSiteRoleEntity]),
  ],
  controllers: [UserController],
  providers: [UserService, FileService, AuthService, LogService, JwtService, EmailExistsRule],
  exports: [UserService],
})
export class UserModule {}
