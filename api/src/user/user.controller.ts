import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { IdListDto } from '../common/dto/id-list.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserService } from './user.service';
import { User } from '../common/entities/user';
import { FilterUserDto } from './dto/filter-user.dto';
import { PagedLisDto } from '../common/dto/paged-list.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @UseInterceptors(ClassSerializerInterceptor)
  async findFilter(@Query() filterDto: FilterUserDto): Promise<PagedLisDto<User>> {
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
  @UseInterceptors(ClassSerializerInterceptor)
  findAll(): Promise<User[]> {
    return this.userService.findAll();
  }

  @Get(':id')
  async findById(@Param('id') id: number): Promise<User> {
    return this.userService.findById(id);
  }

  @Post()
  async create(@Body() createDto: CreateUserDto): Promise<User> {
    return this.userService.create(createDto);
  }

  @Put(':id')
  async update(@Param('id') id: number, @Body() updateDto: UpdateUserDto): Promise<User> {
    return this.userService.update(id, updateDto);
  }

  @Post(':id/upload')
  @UseInterceptors(FileInterceptor('image'))
  async upload(@Param('id') id: number, @UploadedFile() image: Express.Multer.File): Promise<User> {
    return this.userService.upload(id, image);
  }

  @Delete(':id')
  async delete(@Param('id') id: number): Promise<void> {
    await this.userService.delete(id);
  }

  @Delete()
  async deleteMany(@Query() dto: IdListDto): Promise<void> {
    await this.userService.deleteMany(dto.ids);
  }
}
