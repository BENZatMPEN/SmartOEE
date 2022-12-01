import { Injectable } from '@nestjs/common';
import { CreateFaqDto } from './dto/create-faq.dto';
import { FilterFaqDto } from './dto/filter-faq.dto';
import { UpdateFaqDto } from './dto/update-faq.dto';
import { ContentService } from '../common/content/content.service';
import { PagedLisDto } from '../common/dto/paged-list.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Attachment } from '../common/entities/attachment';
import { Faq } from '../common/entities/faq';
import { FaqAttachment } from '../common/entities/faq-attachment';
import * as _ from 'lodash';
import { v4 as uuid } from 'uuid';

@Injectable()
export class FaqService {
  constructor(
    @InjectRepository(Attachment)
    private attachmentRepository: Repository<Attachment>,
    @InjectRepository(Faq)
    private faqRepository: Repository<Faq>,
    @InjectRepository(FaqAttachment)
    private faqAttachmentRepository: Repository<FaqAttachment>,
    private readonly contentService: ContentService,
  ) {}

  async findPagedList(filterDto: FilterFaqDto): Promise<PagedLisDto<Faq>> {
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
      .andWhere(':search is null or faq.topic like :search or faq.remark like :search', {
        search: filterDto.search ? `%${filterDto.search}%` : null,
      })
      .orderBy(`faq.${filterDto.orderBy}`, filterDto.order === 'asc' ? 'ASC' : 'DESC')
      .skip(offset)
      .take(filterDto.rowsPerPage)
      .getManyAndCount();

    return { list: rows, count: count };
  }

  findAll(siteId: number): Promise<Faq[]> {
    return this.faqRepository.findBy({ siteId, deleted: false });
  }

  findById(id: number, siteId: number): Promise<Faq> {
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

  create(createDto: CreateFaqDto): Promise<Faq> {
    return this.faqRepository.save({
      ...createDto,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  async update(id: number, updateDto: UpdateFaqDto): Promise<Faq> {
    const updatingFaq = await this.faqRepository.findOneBy({ id });
    return this.faqRepository.save({
      ..._.assign(updatingFaq, updateDto),
      updatedAt: new Date(),
    });
  }

  async updateFiles(id: number, name: string, images: Express.Multer.File[]): Promise<void> {
    const faq = await this.faqRepository.findOneBy({ id });
    for (const image of images) {
      const attachmentName = uuid();
      const imageUrl = await this.contentService.saveAttachment(attachmentName, image.buffer, image.mimetype);
      const attachment = await this.attachmentRepository.save({
        name: image.originalname,
        url: imageUrl,
        length: image.buffer.length,
        mime: image.mimetype,
        createdAt: new Date(),
      });

      await this.faqAttachmentRepository.save({
        faq,
        attachment,
        groupName: name,
        createdAt: new Date(),
      });
    }

    // for (let image of images) {
    //   const attachmentName = uuid();
    //   const imageUrl = await this.contentService.saveAttachment(attachmentName, image.buffer, image.mimetype);
    //   const attachment = await this.attachmentRepository.create({
    //     name: image.originalname,
    //     url: imageUrl,
    //     length: image.buffer.length,
    //     mime: image.mimetype,
    //   });
    //
    //   await this.faqAttachmentRepository.create({
    //     faqId: id,
    //     attachmentId: attachment.id,
    //     groupName: name,
    //   });
    // }

    // return null;
  }

  async deleteFiles(id: number, attachmentIds: number[]): Promise<void> {
    await this.faqAttachmentRepository
      .createQueryBuilder()
      .delete()
      .where('faqId = :faqId', { faqId: id })
      .andWhere('attachmentId in (:ids)', { ids: attachmentIds })
      .execute();

    // await this.faqAttachmentRepository.destroy({
    //   where: {
    //     [Op.and]: [
    //       {
    //         faqId: id,
    //         attachmentId: {
    //           [Op.in]: attachmentIds,
    //         },
    //       },
    //     ],
    //   },
    // });
    // return null;
  }

  async delete(id: number): Promise<void> {
    const faq = await this.faqRepository.findOneBy({ id });
    faq.deleted = true;
    faq.updatedAt = new Date();
    await this.faqRepository.save(faq);
    // await this.faqRepository.update({ deleted: true }, { where: { id } });
  }

  async deleteMany(ids: number[]): Promise<void> {
    // await this.faqRepository.update({ deleted: true }, { where: { id: ids } });
    const faqs = await this.faqRepository.findBy({ id: In(ids) });
    await this.faqRepository.save(
      faqs.map((faq) => {
        faq.deleted = true;
        faq.updatedAt = new Date();
        return faq;
      }),
    );
  }
}
