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
import { UserEntity } from '../common/entities/user.entity';
import { FilterUserDto } from './dto/filter-user.dto';
import { PagedLisDto } from '../common/dto/paged-list.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FileSavePipe } from '../common/pipe/file-save.pipe';
import { FileInterceptor } from '@nestjs/platform-express';
import { InjectParamIdTo } from '../common/decorators/request-interceptor.dectorator';
import { ChangePasswordDto } from './dto/change-password.dto';

@UseGuards(JwtAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
@Controller('api/users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async findFilter(@Query() filterDto: FilterUserDto): Promise<PagedLisDto<UserEntity>> {
    return this.userService.findPagedList(filterDto);
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

  @Get('options')
  findAllUser(@Query('siteId') siteId: number): Promise<UserEntity[]> {
    return this.userService.findOptions(siteId);
  }

  @Get('all')
  findAll(@Query('siteId') siteId: number): Promise<UserEntity[]> {
    return this.userService.findAll(siteId);
  }

  @Get(':id')
  async findById(@Param('id') id: number, @Query('siteId') siteId: number): Promise<UserEntity> {
    return this.userService.findByIdAndSiteId(id, siteId);
  }

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @Body() createDto: CreateUserDto,
    @UploadedFile(FileSavePipe) image: string,
    @Query('siteId') siteId: number,
  ): Promise<UserEntity> {
    return this.userService.create(createDto, image, siteId);
  }

  @Put(':id')
  @InjectParamIdTo('body')
  @UseInterceptors(FileInterceptor('image'))
  async update(
    @Param('id') id: number,
    @Body() updateDto: UpdateUserDto,
    @UploadedFile(FileSavePipe) image: string,
    @Query('siteId') siteId: number,
  ): Promise<UserEntity> {
    return this.userService.update(id, updateDto, image, siteId);
  }

  @Put(':id/change-password')
  async changePassword(
    @Param('id') id: number,
    @Body() changePasswordDto: ChangePasswordDto,
    @Query('siteId') siteId: number,
  ): Promise<void> {
    await this.userService.changePassword(id, changePasswordDto, siteId);
  }

  @Delete(':id')
  async delete(@Param('id') id: number, @Query('siteId') siteId: number): Promise<void> {
    await this.userService.delete(id, siteId);
  }

  @Delete()
  async deleteMany(
    @Query('ids', new ParseArrayPipe({ items: Number })) ids: number[],
    @Query('siteId') siteId: number,
  ): Promise<void> {
    await this.userService.deleteMany(ids, siteId);
  }
}
