import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../common/entities/user';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { TokenDto } from './dto/token.dto';
import * as bcrypt from 'bcrypt';
import { AuthUserDto } from './dto/auth-user.dto';
import { Role } from '../common/entities/role';
import { LogService } from '../common/services/log.service';
import { UserRole } from '../common/entities/user-role';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private logService: LogService,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(UserRole)
    private userRolesRepository: Repository<UserRole>,
  ) {}

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { email },
      relations: {
        sites: true,
      },
    });
    const isPasswordMatch = await bcrypt.compare(password, user.passwordHash);
    if (user && isPasswordMatch) {
      return user;
    }
    return null;
  }

  async login(user: User): Promise<TokenDto> {
    const dto: AuthUserDto = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      isAdmin: user.isAdmin,
      sites: user.sites.map((site) => site.id),
    };

    for (const site of user.sites) {
      await this.logService.logAction(site.id, `${user.email} logged in`);
    }

    return {
      accessToken: this.jwtService.sign(dto),
      user: dto,
    };
  }

  async findRoleByUserIdAndSiteId(userId: number, siteId): Promise<Role> {
    const userRole = await this.userRolesRepository.findOne({ where: { userId, siteId }, relations: ['role'] });
    return userRole?.role;
  }
}
