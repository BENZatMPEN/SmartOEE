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
import { CreateAdminUserDto } from './dto/create-admin-user.dto';
import { UpdateAdminUserDto } from './dto/update-admin-user.dto';
import { AdminUserService } from './admin-user.service';
import { UserEntity } from '../common/entities/user-entity';
import { FilterAdminUserDto } from './dto/filter-admin-user.dto';
import { PagedLisDto } from '../common/dto/paged-list.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FileSavePipe } from '../common/pipe/file-save.pipe';
import { FileInterceptor } from '@nestjs/platform-express';
import { InjectParamIdTo } from '../common/decorators/request-interceptor.dectorator';

@UseGuards(JwtAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
@Controller('admin/users')
export class AdminUserController {
  constructor(private readonly userService: AdminUserService) {}

  @Get()
  async findFilter(@Query() filterDto: FilterAdminUserDto): Promise<PagedLisDto<UserEntity>> {
    return this.userService.findPagedList(filterDto);
  }

  @Get(':id')
  async findById(@Param('id') id: number): Promise<UserEntity> {
    return this.userService.findById(id);
  }

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  async create(@Body() createDto: CreateAdminUserDto, @UploadedFile(FileSavePipe) image: string): Promise<UserEntity> {
    return this.userService.create(createDto, image);
  }

  @Put(':id')
  @InjectParamIdTo('body')
  @UseInterceptors(FileInterceptor('image'))
  async update(
    @Param('id') id: number,
    @Body() updateDto: UpdateAdminUserDto,
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
