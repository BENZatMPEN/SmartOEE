import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../common/entities/user-entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { TokenDto } from './dto/token.dto';
import * as bcrypt from 'bcrypt';
import { AuthUserDto } from './dto/auth-user.dto';
import { LogService } from '../common/services/log.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private logService: LogService,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  async validateUser(email: string, password: string): Promise<UserEntity> {
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      return null;
    }

    const isPasswordMatch = await bcrypt.compare(password, user.passwordHash);
    if (user && isPasswordMatch) {
      return user;
    }
    return null;
  }

  async login(user: UserEntity): Promise<TokenDto> {
    const dto: AuthUserDto = {
      id: user.id,
      email: user.email,
    };

    return {
      accessToken: this.jwtService.sign(dto),
      user: dto,
    };
  }
}
