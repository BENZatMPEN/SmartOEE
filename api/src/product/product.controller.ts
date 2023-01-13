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
import { PagedLisDto } from '../common/dto/paged-list.dto';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { FilterProductDto } from './dto/filter-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductEntity } from '../common/entities/product-entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { OptionItem } from '../common/type/option-item';
import { FileSavePipe } from '../common/pipe/file-save.pipe';

@UseGuards(JwtAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  findFilter(@Query() filterDto: FilterProductDto): Promise<PagedLisDto<ProductEntity>> {
    return this.productService.findPagedList(filterDto);
  }

  @Get('options')
  findAllOee(@Query('siteId') siteId: number): Promise<OptionItem[]> {
    return this.productService.findOptions(siteId);
  }

  @Get('all')
  findAll(@Query('siteId') siteId: number): Promise<ProductEntity[]> {
    return this.productService.findAll(siteId);
  }

  @Get(':id')
  findById(@Param('id') id: number, @Query('siteId') siteId: number): Promise<ProductEntity> {
    return this.productService.findById(id, siteId);
  }

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  create(
    @Body() createDto: CreateProductDto,
    @UploadedFile(FileSavePipe) image: string,
    @Query('siteId') siteId: number,
  ): Promise<ProductEntity> {
    return this.productService.create(createDto, image, siteId);
  }

  @Put(':id')
  @UseInterceptors(FileInterceptor('image'))
  update(
    @Param('id') id: number,
    @Body() updateDto: UpdateProductDto,
    @UploadedFile(FileSavePipe) image: string,
    @Query('siteId') siteId: number,
  ): Promise<ProductEntity> {
    return this.productService.update(id, updateDto, image, siteId);
  }

  @Delete(':id')
  async delete(@Param('id') id: number, @Query('siteId') siteId: number): Promise<void> {
    await this.productService.delete(id, siteId);
  }

  @Delete()
  async deleteMany(
    @Query('ids', new ParseArrayPipe({ items: Number })) ids: number[],
    @Query('siteId') siteId: number,
  ): Promise<void> {
    await this.productService.deleteMany(ids, siteId);
  }
}
