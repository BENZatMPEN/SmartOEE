import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  ParseArrayPipe,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserService } from './user.service';
import { UserEntity } from '../common/entities/user-entity';
import { FilterUserDto } from './dto/filter-user.dto';
import { PagedLisDto } from '../common/dto/paged-list.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FileSavePipe } from '../common/pipe/file-save.pipe';
import { FileInterceptor } from '@nestjs/platform-express';
import { InjectParamIdTo } from '../common/decorators/request-interceptor.dectorator';
import { ReqAuthUser } from '../common/decorators/auth-user.decorator';
import { AuthUserDto } from '../auth/dto/auth-user.dto';

@UseGuards(JwtAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  private getSiteId(authUser: AuthUserDto, siteId: number): number {
    return authUser && authUser.isAdmin ? null : siteId;
  }

  @Get()
  async findFilter(
    @Query() filterDto: FilterUserDto,
    @ReqAuthUser() authUser: AuthUserDto,
    @Query('siteId') siteId: number,
  ): Promise<PagedLisDto<UserEntity>> {
    return this.userService.findPagedList(filterDto, this.getSiteId(authUser, siteId));
  }

  // @Get('canRead')
  // @UseGuards(PoliciesGuard)
  // @CheckPolicies((ability: AppAbility) => ability.can(RoleAction.Read, RoleSubject.Dashboard))
  // test(): Promise<User[]> {
  //   return this.userService.findAll();
  // }
  //
  // @Get('canUpdate')
  // @UseGuards(PoliciesGuard)
  // @CheckPolicies((ability: AppAbility) => ability.can(RoleAction.Update, RoleSubject.Dashboard))
  // test1(): Promise<User[]> {
  //   return this.userService.findAll();
  // }

  @Get('all')
  findAll(@ReqAuthUser() authUser: AuthUserDto, @Query('siteId') siteId: number): Promise<UserEntity[]> {
    return this.userService.findAll(this.getSiteId(authUser, siteId));
  }

  @Get(':id')
  async findById(
    @Param('id') id: number,
    @ReqAuthUser() authUser: AuthUserDto,
    @Query('siteId') siteId: number,
  ): Promise<UserEntity> {
    return this.userService.findById(id, this.getSiteId(authUser, siteId));
  }

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @Body() createDto: CreateUserDto,
    @UploadedFile(FileSavePipe) image: string,
    @ReqAuthUser() authUser: AuthUserDto,
    @Query('siteId') siteId: number,
  ): Promise<UserEntity> {
    return this.userService.create(createDto, image, this.getSiteId(authUser, siteId));
  }

  @Put(':id')
  @InjectParamIdTo('body')
  @UseInterceptors(FileInterceptor('image'))
  async update(
    @Param('id') id: number,
    @Body() updateDto: UpdateUserDto,
    @UploadedFile(FileSavePipe) image: string,
    @ReqAuthUser() authUser: AuthUserDto,
    @Query('siteId') siteId: number,
  ): Promise<UserEntity> {
    return this.userService.update(id, updateDto, image, this.getSiteId(authUser, siteId));
  }

  @Delete(':id')
  async delete(
    @Param('id') id: number,
    @ReqAuthUser() authUser: AuthUserDto,
    @Query('siteId') siteId: number,
  ): Promise<void> {
    await this.userService.delete(id, this.getSiteId(authUser, siteId));
  }

  @Delete()
  async deleteMany(
    @Query('ids', new ParseArrayPipe({ items: Number })) ids: number[],
    @ReqAuthUser() authUser: AuthUserDto,
    @Query('siteId') siteId: number,
  ): Promise<void> {
    await this.userService.deleteMany(ids, this.getSiteId(authUser, siteId));
  }
}
