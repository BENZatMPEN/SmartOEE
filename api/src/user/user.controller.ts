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

@UseGuards(JwtAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
@Controller('users')
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

  @Get('all')
  findAll(): Promise<UserEntity[]> {
    return this.userService.findAll();
  }

  @Get(':id')
  async findById(@Param('id') id: number): Promise<UserEntity> {
    return this.userService.findById(id);
  }

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  async create(@Body() createDto: CreateUserDto, @UploadedFile(FileSavePipe) image: string): Promise<UserEntity> {
    return this.userService.create(createDto, image);
  }

  @Put(':id')
  @InjectParamIdTo('body')
  @UseInterceptors(FileInterceptor('image'))
  async update(
    @Param('id') id: number,
    @Body() updateDto: UpdateUserDto,
    @UploadedFile(FileSavePipe) image: string,
  ): Promise<UserEntity> {
    return this.userService.update(id, updateDto, image);
  }

  @Delete(':id')
  async delete(@Param('id') id: number): Promise<void> {
    await this.userService.delete(id);
  }

  @Delete()
  async deleteMany(@Query('ids', new ParseArrayPipe({ items: Number })) ids: number[]): Promise<void> {
    await this.userService.deleteMany(ids);
  }
}
