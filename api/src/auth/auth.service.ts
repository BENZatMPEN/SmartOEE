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
    @InjectRepository(RoleEntity)
    private roleRepository: Repository<RoleEntity>,
  ) {}

  async validateUser(email: string, password: string): Promise<UserEntity> {
    const user = await this.userRepository.findOne({
      where: { email },
      // relations: {
      //   sites: true,
      // },
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

  private getUserSites(user: UserEntity): Promise<SiteEntity[]> {
    return user.isAdmin
      ? this.siteRepository.findBy({ deleted: false })
      : this.siteRepository
          .createQueryBuilder('s')
          .innerJoin('s.users', 'su', 'su.id = :userId', { userId: user.id })
          .where('deleted = false')
          .getMany();
  }

  async findRoleByUserIdAndSiteId(userId: number, siteId: number): Promise<RoleEntity> {
    const user = await this.userRepository.findOneBy({ id: userId });
    return user.isAdmin
      ? null
      : this.roleRepository
          .createQueryBuilder('r')
          .innerJoin('r.users', 'ru', 'ru.id = :userId', { userId: user.id })
          .where('siteId = :siteId and deleted = false', { siteId })
          .getOne();
  }
}
