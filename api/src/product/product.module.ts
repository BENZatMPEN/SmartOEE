import { Module } from '@nestjs/common';
import { ContentModule } from '../common/content/content.module';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../common/entities/product';
import { Site } from '../common/entities/site';

@Module({
  imports: [ContentModule, TypeOrmModule.forFeature([Product, Site])],
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModule {}
