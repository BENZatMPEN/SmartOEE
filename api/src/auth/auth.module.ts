import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './local.strategy';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../common/entities/user-entity';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { AuthController } from './auth.controller';
import { LogService } from '../common/services/log.service';
import { HistoryLogEntity } from '../common/entities/history-log-entity';
import { SiteEntity } from '../common/entities/site-entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration, { Config } from '../configuration';
import { RoleEntity } from '../common/entities/role-entity';
import { UserService } from '../user/user.service';
import { FileService } from '../common/services/file.service';
import { EmailExistsRule } from '../common/validations/email-exists.validator';

@Module({
  imports: [
    ConfigModule.forFeature(configuration),
    TypeOrmModule.forFeature([SiteEntity, UserEntity, RoleEntity, HistoryLogEntity]),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const config = configService.get<Config>('config');
        return {
          secret: config.token.secret,
          signOptions: { expiresIn: config.token.expiresIn },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, UserService, FileService, LogService, LocalStrategy, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
