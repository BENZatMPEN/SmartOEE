import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../common/entities/user-entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { TokenDto } from './dto/token.dto';
import * as bcrypt from 'bcrypt';
import { AuthUserDto } from './dto/auth-user.dto';
import { RoleEntity } from '../common/entities/role-entity';
import { LogService } from '../common/services/log.service';
import { UserSiteRoleEntity } from '../common/entities/user-site-role-entity';
import { SiteEntity } from '../common/entities/site-entity';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private logService: LogService,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(SiteEntity)
    private siteRepository: Repository<SiteEntity>,
    @InjectRepository(UserSiteRoleEntity)
    private userSiteRoleEntityRepository: Repository<UserSiteRoleEntity>,
  ) {}

  async validateUser(email: string, password: string): Promise<UserEntity> {
    const user = await this.userRepository.findOne({
      where: { email },
      // relations: {
      //   sites: true,
      // },
    });
    const isPasswordMatch = await bcrypt.compare(password, user.passwordHash);
    if (user && isPasswordMatch) {
      return user;
    }
    return null;
  }

  async login(user: UserEntity): Promise<TokenDto> {
    const sites = await this.getUserSites(user);
    const dto: AuthUserDto = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      isAdmin: user.isAdmin,
      sites: sites.map((item) => item.id),
    };

    // for (const site of user.sites) {
    //   await this.logService.logAction(site.id, `${user.email} logged in`);
    // }

    return {
      accessToken: this.jwtService.sign(dto),
      user: dto,
    };
  }

  private async getUserSites(user: UserEntity): Promise<SiteEntity[]> {
    if (user.isAdmin) {
      return await this.siteRepository.find();
    } else {
      const userSiteRoles = await this.userSiteRoleEntityRepository.find({
        relations: { site: true },
        where: {
          userId: user.id,
          site: {
            deleted: false,
          },
        },
      });

      return userSiteRoles.map((item) => item.site);
    }
  }

  async findRoleByUserIdAndSiteId(userId: number, siteId): Promise<RoleEntity> {
    const userRole = await this.userSiteRoleEntityRepository.findOne({
      where: { userId, siteId },
      relations: ['role'],
    });
    return userRole?.role;
  }
}
