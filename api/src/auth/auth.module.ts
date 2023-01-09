import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './local.strategy';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../common/entities/user-entity';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { AuthController } from './auth.controller';
import { jwtConstants } from './constants';
import { LogService } from '../common/services/log.service';
import { HistoryLogEntity } from '../common/entities/history-log-entity';
import { UserSiteRoleEntity } from '../common/entities/user-site-role-entity';
import { SiteEntity } from '../common/entities/site-entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([SiteEntity, UserEntity, UserSiteRoleEntity, HistoryLogEntity]),
    PassportModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: jwtConstants.expiresIn },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, LogService, LocalStrategy, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
