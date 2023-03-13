import { Module } from '@nestjs/common';
import { AdminUserService } from './admin-user.service';
import { AdminUserController } from './admin-user.controller';
import { UserEntity } from '../common/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CaslModule } from '../casl/casl.module';
import { JwtService } from '@nestjs/jwt';
import { FileService } from '../common/services/file.service';
import { EmailExistsRule } from '../common/validations/email-exists.validator';
import { SiteEntity } from '../common/entities/site.entity';
import { UserService } from '../user/user.service';
import { RoleEntity } from '../common/entities/role.entity';

@Module({
  imports: [CaslModule, TypeOrmModule.forFeature([UserEntity, SiteEntity, RoleEntity])],
  controllers: [AdminUserController],
  providers: [AdminUserService, FileService, UserService, JwtService, EmailExistsRule],
  exports: [AdminUserService],
})
export class AdminUserModule {}
