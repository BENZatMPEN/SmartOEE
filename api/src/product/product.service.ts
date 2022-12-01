import { Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { FilterProductDto } from './dto/filter-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ContentService } from '../common/content/content.service';
import { PagedLisDto } from '../common/dto/paged-list.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Product } from '../common/entities/product';
import * as _ from 'lodash';
import { OptionItem } from '../common/type/option-item';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    private readonly contentService: ContentService,
  ) {}

  async findPagedList(filterDto: FilterProductDto): Promise<PagedLisDto<Product>> {
    const offset = filterDto.page == 0 ? 0 : filterDto.page * filterDto.rowsPerPage;
    const [rows, count] = await this.productRepository
      .createQueryBuilder()
      .where('deleted = false')
      .andWhere('siteId = :siteId', { siteId: filterDto.siteId })
      .andWhere(':search is null or sku like :search or name like :search or remark like :search', {
        search: filterDto.search ? `%${filterDto.search}%` : null,
      })
      .orderBy(`${filterDto.orderBy}`, filterDto.order === 'asc' ? 'ASC' : 'DESC')
      .skip(offset)
      .take(filterDto.rowsPerPage)
      .getManyAndCount();

    return { list: rows, count: count };
  }

  findAll(siteId: number): Promise<Product[]> {
    return this.productRepository.findBy({ siteId, deleted: false });
  }

  async findOptions(siteId: number): Promise<OptionItem[]> {
    const list = await this.productRepository.find({
      select: ['id', 'name'],
      where: { siteId, deleted: false },
    });

    return list.map((item) => ({ id: item.id, name: item.name }));
  }

  findById(id: number, siteId: number): Promise<Product> {
    return this.productRepository.findOne({
      where: { id, siteId, deleted: false },
    });
  }

  create(createDto: CreateProductDto): Promise<Product> {
    return this.productRepository.save({
      ...createDto,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  async update(id: number, updateDto: UpdateProductDto): Promise<Product> {
    const updatingProduct = await this.productRepository.findOneBy({ id });
    return this.productRepository.save({
      ..._.assign(updatingProduct, updateDto),
      updatedAt: new Date(),
    });
  }

  async upload(id: number, image: Express.Multer.File): Promise<Product> {
    const product = await this.productRepository.findOneBy({ id });
    if (image) {
      product.imageUrl = await this.contentService.saveProductImage(
        product.id.toString(),
        image.buffer,
        image.mimetype,
      );
      await this.productRepository.save(product);
    }

    return product;
  }

  async delete(id: number): Promise<void> {
    const product = await this.productRepository.findOneBy({ id });
    product.deleted = true;
    product.updatedAt = new Date();
    await this.productRepository.save(product);
  }

  async deleteMany(ids: number[]): Promise<void> {
    const products = await this.productRepository.findBy({ id: In(ids) });
    await this.productRepository.save(
      products.map((product) => {
        product.deleted = true;
        product.updatedAt = new Date();
        return product;
      }),
    );
  }
}
