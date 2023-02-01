import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../common/entities/user-entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { TokenDto } from './dto/token.dto';
import * as bcrypt from 'bcrypt';
import { AuthUserDto } from './dto/auth-user.dto';
import { LogService } from '../common/services/log.service';
import { ChangePasswordDto } from '../user/dto/change-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { FileService } from '../common/services/file.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private logService: LogService,
    private fileService: FileService,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  private readonly saltOrRounds = 10;

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

  findByEmail(email: string): Promise<UserEntity> {
    return this.userRepository.findOneBy({ email });
  }

  findByIdAndSiteId(id: number, siteId: number): Promise<UserEntity> {
    return this.userRepository
      .createQueryBuilder('u')
      .leftJoinAndSelect('u.sites', 'us')
      .leftJoinAndSelect('u.roles', 'ur', 'ur.siteId = :siteId', { siteId })
      .where('u.id = :id', { id })
      .getOne();
  }

  async updateProfile(id: number, updateDto: UpdateProfileDto, imageName: string): Promise<UserEntity> {
    const updatingUser = await this.userRepository.findOneBy({ id });
    const { imageName: existingImageName } = updatingUser;
    if (imageName && existingImageName) {
      await this.fileService.deleteFile(existingImageName);
    }

    return await this.userRepository.save({
      id: updatingUser.id,
      ...updateDto,
      imageName: !imageName ? existingImageName : imageName,
      updatedAt: new Date(),
    });
  }

  async changePassword(id: number, changePasswordDto: ChangePasswordDto): Promise<void> {
    const { password } = changePasswordDto;
    const updatingUser = await this.userRepository.findOneBy({ id });
    const passwordHash = await bcrypt.hash(password, this.saltOrRounds);
    await this.userRepository.save({
      id: updatingUser.id,
      passwordHash,
      updatedAt: new Date(),
    });
  }
}
