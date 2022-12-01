import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './local.strategy';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../common/entities/user';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { AuthController } from './auth.controller';
import { jwtConstants } from './constants';
import { LogService } from '../common/services/log.service';
import { HistoryLog } from '../common/entities/history-log';
import { UserRole } from '../common/entities/user-role';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserRole, HistoryLog]),
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
