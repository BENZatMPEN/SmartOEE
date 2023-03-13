import { Module } from '@nestjs/common';
import { FaqService } from './faq.service';
import { FaqController } from './faq.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttachmentEntity } from '../common/entities/attachment.entity';
import { FaqEntity } from '../common/entities/faq.entity';
import { FaqAttachmentEntity } from '../common/entities/faq-attachment.entity';
import { SiteEntity } from '../common/entities/site.entity';
import { FileService } from '../common/services/file.service';

@Module({
  imports: [TypeOrmModule.forFeature([AttachmentEntity, FaqEntity, FaqAttachmentEntity, SiteEntity])],
  controllers: [FaqController],
  providers: [FaqService, FileService],
})
export class FaqModule {}
