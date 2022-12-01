import { Module } from '@nestjs/common';
import { ContentModule } from '../common/content/content.module';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from '../common/entities/user';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from '../common/entities/role';
import { Site } from '../common/entities/site';
import { CaslModule } from '../casl/casl.module';
import { UserRole } from '../common/entities/user-role';
import { AuthService } from '../auth/auth.service';
import { LogService } from '../common/services/log.service';
import { JwtService } from '@nestjs/jwt';
import { HistoryLog } from '../common/entities/history-log';

@Module({
  imports: [ContentModule, CaslModule, TypeOrmModule.forFeature([User, Role, Site, HistoryLog, UserRole])],
  controllers: [UserController],
  providers: [UserService, AuthService, LogService, JwtService],
  exports: [UserService],
})
export class UserModule {}
