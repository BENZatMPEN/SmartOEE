import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductEntity } from '../common/entities/product.entity';
import { SiteEntity } from '../common/entities/site.entity';
import { FileService } from '../common/services/file.service';

@Module({
  imports: [TypeOrmModule.forFeature([ProductEntity, SiteEntity])],
  controllers: [ProductController],
  providers: [ProductService, FileService],
})
export class ProductModule {}
