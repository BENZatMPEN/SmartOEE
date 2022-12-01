import { Module } from '@nestjs/common';
import { ContentModule } from '../common/content/content.module';
import { FaqService } from './faq.service';
import { FaqController } from './faq.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Attachment } from '../common/entities/attachment';
import { Faq } from '../common/entities/faq';
import { FaqAttachment } from '../common/entities/faq-attachment';
import { Site } from '../common/entities/site';

@Module({
  imports: [ContentModule, TypeOrmModule.forFeature([Attachment, Faq, FaqAttachment, Site])],
  controllers: [FaqController],
  providers: [FaqService],
})
export class FaqModule {}
