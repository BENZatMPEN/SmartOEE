import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { IdListDto } from '../common/dto/id-list.dto';
import { PagedLisDto } from '../common/dto/paged-list.dto';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { FilterProductDto } from './dto/filter-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from '../common/entities/product';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ReqDec } from '../common/decorator/req-dec';
import { SiteIdPipe } from '../common/pipe/site-id-pipe.service';
import { Site } from '../common/entities/site';
import { FileInterceptor } from '@nestjs/platform-express';
import { OptionItem } from '../common/type/option-item';

@UseGuards(JwtAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  findFilter(
    @Query() filterDto: FilterProductDto,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @ReqDec(SiteIdPipe) siteId: number,
  ): Promise<PagedLisDto<Product>> {
    return this.productService.findPagedList(filterDto);
  }

  @Get('options')
  findAllOee(@ReqDec(SiteIdPipe) siteId: number): Promise<OptionItem[]> {
    return this.productService.findOptions(siteId);
  }

  @Get('all')
  findAll(@ReqDec(SiteIdPipe) siteId: number): Promise<Product[]> {
    return this.productService.findAll(siteId);
  }

  @Get(':id')
  async findById(@Param('id') id: number, @ReqDec(SiteIdPipe) siteId: number): Promise<Product> {
    const product = await this.productService.findById(id, siteId);
    if (!product) {
      throw new NotFoundException();
    }

    return product;
  }

  @Post()
  create(
    @Body() createDto: CreateProductDto,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @ReqDec(SiteIdPipe) siteId: number,
  ): Promise<Product> {
    return this.productService.create(createDto);
  }

  @Put(':id')
  update(
    @Param('id') id: number,
    @Body() updateDto: UpdateProductDto,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @ReqDec(SiteIdPipe) siteId: number,
  ): Promise<Product> {
    return this.productService.update(id, updateDto);
  }

  @Post(':id/upload')
  @UseInterceptors(FileInterceptor('image'))
  upload(
    @Param('id') id: number,
    @UploadedFile() image: Express.Multer.File,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @ReqDec(SiteIdPipe) siteId: number,
  ): Promise<Product> {
    return this.productService.upload(id, image);
  }

  @Delete(':id')
  async delete(
    @Param('id') id: number,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @ReqDec(SiteIdPipe) siteId: number,
  ): Promise<void> {
    await this.productService.delete(id);
  }

  @Delete()
  async deleteMany(
    @Query() dto: IdListDto,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @ReqDec(SiteIdPipe) siteId: number,
  ): Promise<void> {
    await this.productService.deleteMany(dto.ids);
  }
}
