import { Injectable } from '@nestjs/common';
import { CreateFaqDto } from './dto/create-faq.dto';
import { FilterFaqDto } from './dto/filter-faq.dto';
import { UpdateFaqDto } from './dto/update-faq.dto';
import { PagedLisDto } from '../common/dto/paged-list.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { AttachmentEntity } from '../common/entities/attachment.entity';
import { FaqEntity } from '../common/entities/faq.entity';
import { FaqAttachmentEntity } from '../common/entities/faq-attachment.entity';
import { FileService } from '../common/services/file.service';
import { FileInfo } from '../common/type/file-info';

@Injectable()
export class FaqService {
  constructor(
    @InjectRepository(AttachmentEntity)
    private attachmentRepository: Repository<AttachmentEntity>,
    @InjectRepository(FaqEntity)
    private faqRepository: Repository<FaqEntity>,
    @InjectRepository(FaqAttachmentEntity)
    private faqAttachmentRepository: Repository<FaqAttachmentEntity>,
    private readonly fileService: FileService,
  ) {}

  async findPagedList(filterDto: FilterFaqDto): Promise<PagedLisDto<FaqEntity>> {
    const offset = filterDto.page == 0 ? 0 : filterDto.page * filterDto.rowsPerPage;
    const [rows, count] = await this.faqRepository
      .createQueryBuilder('faq')
      .leftJoin('faq.createdByUser', 'cu')
      .leftJoin('faq.approvedByUser', 'au')
      .addSelect([
        'cu.id',
        'cu.firstName',
        'cu.lastName',
        'cu.nickname',
        'au.id',
        'au.firstName',
        'au.lastName',
        'au.nickname',
      ])
      .where('faq.deleted = false')
      .andWhere('faq.siteId = :siteId', { siteId: filterDto.siteId })
      .andWhere('(:search is null or faq.topic like :search or faq.remark like :search)', {
        search: filterDto.search ? `%${filterDto.search}%` : null,
      })
      .orderBy(`faq.${filterDto.orderBy}`, filterDto.order === 'asc' ? 'ASC' : 'DESC')
      .skip(offset)
      .take(filterDto.rowsPerPage)
      .getManyAndCount();

    return { list: rows, count: count };
  }

  findAll(siteId: number): Promise<FaqEntity[]> {
    return this.faqRepository.findBy({ siteId, deleted: false });
  }

  findById(id: number, siteId: number): Promise<FaqEntity> {
    return this.faqRepository
      .createQueryBuilder('faq')
      .leftJoin('faq.createdByUser', 'cu')
      .leftJoin('faq.approvedByUser', 'au')
      .leftJoinAndSelect('faq.attachments', 'a')
      .leftJoinAndSelect('a.attachment', 'aa')
      .addSelect([
        'cu.id',
        'cu.firstName',
        'cu.lastName',
        'cu.nickname',
        'au.id',
        'au.firstName',
        'au.lastName',
        'au.nickname',
      ])
      .where('faq.deleted = false')
      .andWhere('faq.id = :id and faq.siteId = :siteId', { id, siteId })
      .getOne();
  }

  async create(
    createDto: CreateFaqDto,
    siteId: number,
    imageInfoList: FileInfo[],
    fileInfoList: FileInfo[],
  ): Promise<FaqEntity> {
    const { approvedByUserId, ...dto } = createDto;
    const faq = await this.faqRepository.save({
      ...dto,
      siteId,
      approvedByUserId: approvedByUserId === -1 ? null : approvedByUserId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await this.saveAttachment('images', faq, imageInfoList);
    await this.saveAttachment('attachments', faq, fileInfoList);
    return faq;
  }

  async update(
    id: number,
    updateDto: UpdateFaqDto,
    siteId: number,
    imageInfoList: FileInfo[],
    fileInfoList: FileInfo[],
  ): Promise<FaqEntity> {
    const { approvedByUserId, deletingAttachments, ...dto } = updateDto;
    const updatingFaq = await this.faqRepository.findOneBy({ id, siteId });
    const faq = await this.faqRepository.save({
      ...updatingFaq,
      ...dto,
      approvedByUserId: approvedByUserId === -1 ? null : approvedByUserId,
      updatedAt: new Date(),
    });

    if (deletingAttachments && deletingAttachments.length > 0) {
      await this.faqAttachmentRepository
        .createQueryBuilder()
        .delete()
        .where('faqId = :faqId', { faqId: id })
        .andWhere('attachmentId in (:ids)', { ids: deletingAttachments })
        .execute();
    }

    await this.saveAttachment('images', faq, imageInfoList);
    await this.saveAttachment('attachments', faq, fileInfoList);
    return faq;
  }

  private async saveAttachment(key: string, faq: FaqEntity, fileInfoList: FileInfo[]) {
    if (fileInfoList) {
      for (const fileInfo of fileInfoList) {
        const attachment = await this.attachmentRepository.save({
          name: fileInfo.name,
          fileName: fileInfo.fileName,
          length: fileInfo.length,
          mime: fileInfo.mime,
          createdAt: new Date(),
        });

        await this.faqAttachmentRepository.save({
          faq,
          attachment,
          groupName: key,
          createdAt: new Date(),
        });
      }
    }
  }

  async delete(id: number, siteId: number): Promise<void> {
    const faq = await this.faqRepository.findOneBy({ id, siteId });
    faq.deleted = true;
    faq.updatedAt = new Date();
    await this.faqRepository.save(faq);
  }

  async deleteMany(ids: number[], siteId: number): Promise<void> {
    const faqs = await this.faqRepository.findBy({ id: In(ids), siteId });
    await this.faqRepository.save(
      faqs.map((faq) => {
        faq.deleted = true;
        faq.updatedAt = new Date();
        return faq;
      }),
    );
  }
}
