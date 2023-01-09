import { Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { FilterProductDto } from './dto/filter-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PagedLisDto } from '../common/dto/paged-list.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { ProductEntity } from '../common/entities/product-entity';
import { OptionItem } from '../common/type/option-item';
import { FileService } from '../common/services/file.service';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(ProductEntity)
    private productRepository: Repository<ProductEntity>,
    private fileService: FileService,
  ) {}

  async findPagedList(filterDto: FilterProductDto): Promise<PagedLisDto<ProductEntity>> {
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

  findAll(siteId: number): Promise<ProductEntity[]> {
    return this.productRepository.findBy({ siteId, deleted: false });
  }

  async findOptions(siteId: number): Promise<OptionItem[]> {
    const list = await this.productRepository.find({
      select: ['id', 'name'],
      where: { siteId, deleted: false },
    });

    return list.map((item) => ({ id: item.id, name: item.name }));
  }

  findById(id: number, siteId: number): Promise<ProductEntity> {
    return this.productRepository.findOne({
      where: { id, siteId, deleted: false },
    });
  }

  create(createDto: CreateProductDto, imageName: string): Promise<ProductEntity> {
    return this.productRepository.save({
      ...createDto,
      imageName,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  async update(id: number, updateDto: UpdateProductDto, imageName: string): Promise<ProductEntity> {
    const updatingProduct = await this.productRepository.findOneBy({ id });
    const { imageName: existingImageName } = updatingProduct;
    if (imageName && existingImageName) {
      await this.fileService.deleteFile(existingImageName);
    }

    return this.productRepository.save({
      ...updatingProduct,
      ...updateDto,
      imageName: !imageName ? existingImageName : imageName,
      updatedAt: new Date(),
    });
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
