import { Injectable } from '@nestjs/common';
import { CreateProblemSolutionDto } from './dto/create-problem-solution.dto';
import { FilterProblemSolutionDto } from './dto/filter-problem-solution.dto';
import { UpdateProblemSolutionDto } from './dto/update-problem-solution.dto';
import { ContentService } from '../common/content/content.service';
import { PagedLisDto } from '../common/dto/paged-list.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Attachment } from '../common/entities/attachment';
import { ProblemSolution } from '../common/entities/problem-solution';
import { ProblemSolutionAttachment } from '../common/entities/problem-solution-attachment';
import * as _ from 'lodash';
import { v4 as uuid } from 'uuid';

@Injectable()
export class ProblemSolutionService {
  constructor(
    @InjectRepository(Attachment)
    private attachmentRepository: Repository<Attachment>,
    @InjectRepository(ProblemSolution)
    private problemSolutionRepository: Repository<ProblemSolution>,
    @InjectRepository(ProblemSolutionAttachment)
    private problemSolutionAttachmentRepository: Repository<ProblemSolutionAttachment>,
    private readonly contentService: ContentService,
  ) {}

  async findPagedList(filterDto: FilterProblemSolutionDto): Promise<PagedLisDto<ProblemSolution>> {
    const offset = filterDto.page == 0 ? 0 : filterDto.page * filterDto.rowsPerPage;
    const [rows, count] = await this.problemSolutionRepository
      .createQueryBuilder('ps')
      .leftJoin('ps.headProjectUser', 'hu')
      .leftJoin('ps.approvedByUser', 'au')
      .leftJoin('ps.oee', 'o')
      .addSelect([
        'hu.id',
        'hu.firstName',
        'hu.lastName',
        'hu.nickname',
        'au.id',
        'au.firstName',
        'au.lastName',
        'au.nickname',
        'o.id',
        'o.productionName',
      ])
      .where('ps.deleted = false')
      .andWhere('ps.siteId = :siteId', { siteId: filterDto.siteId })
      .andWhere(':search is null or ps.name like :search or ps.remark like :search', {
        search: filterDto.search ? `%${filterDto.search}%` : null,
      })
      .orderBy(`ps.${filterDto.orderBy}`, filterDto.order === 'asc' ? 'ASC' : 'DESC')
      .skip(offset)
      .take(filterDto.rowsPerPage)
      .getManyAndCount();

    return { list: rows, count: count };
  }

  findAll(siteId: number): Promise<ProblemSolution[]> {
    return this.problemSolutionRepository.findBy({ siteId, deleted: false });
    // return this.problemSolutionRepository.findAll({ where: { deleted: false } });
  }

  findById(id: number, siteId: number): Promise<ProblemSolution> {
    return this.problemSolutionRepository
      .createQueryBuilder('ps')
      .leftJoin('ps.headProjectUser', 'hu')
      .leftJoin('ps.approvedByUser', 'au')
      .leftJoin('ps.oee', 'o')
      .leftJoinAndSelect('ps.attachments', 'a')
      .leftJoinAndSelect('a.attachment', 'aa')
      .leftJoinAndSelect('ps.tasks', 't')
      .leftJoin('t.assigneeUser', 'tau')
      .leftJoinAndSelect('t.attachments', 'ta')
      .leftJoinAndSelect('ta.attachment', 'taa')
      .addSelect([
        'hu.id',
        'hu.firstName',
        'hu.lastName',
        'hu.nickname',
        'au.id',
        'au.firstName',
        'au.lastName',
        'au.nickname',
        'o.id',
        'o.productionName',
        'tau.id',
        'tau.firstName',
        'tau.lastName',
        'tau.nickname',
      ])
      .where('ps.deleted = false')
      .andWhere('ps.id = :id and ps.siteId = :siteId', { id, siteId })
      .getOne();
  }

  async create(createDto: CreateProblemSolutionDto): Promise<ProblemSolution> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { tasks, ...dto } = createDto;
    return this.problemSolutionRepository.save({
      ...dto,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    // const { tasks, ...dto } = createDto;
    // const problemSolution = await this.problemSolutionRepository.create({
    //   ...dto,
    // });
    //
    // return problemSolution.reload();
    // return null;
  }

  async update(id: number, updateDto: UpdateProblemSolutionDto): Promise<ProblemSolution> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { tasks, ...dto } = updateDto;
    const updatingProblemSolution = await this.problemSolutionRepository.findOneBy({ id });
    return this.problemSolutionRepository.save({
      ..._.assign(updatingProblemSolution, dto),
      updatedAt: new Date(),
    });
    // const problemSolution = await this.problemSolutionRepository.findByPk(id);
    // await problemSolution.update({
    //   ...updateDto,
    // });
    //
    // return problemSolution.reload();
  }

  async updateFiles(id: number, name: string, images: Express.Multer.File[]): Promise<void> {
    const problemSolution = await this.problemSolutionRepository.findOneBy({ id });
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

      await this.problemSolutionAttachmentRepository.save({
        problemSolution,
        attachment,
        groupName: name,
        createdAt: new Date(),
      });
    }
    // return null;
  }

  async deleteFiles(id: number, attachmentIds: number[]): Promise<void> {
    await this.problemSolutionAttachmentRepository
      .createQueryBuilder()
      .delete()
      .where('problemSolutionId = :problemSolutionId', { problemSolutionId: id })
      .andWhere('attachmentId in (:ids)', { ids: attachmentIds })
      .execute();
    // await this.problemSolutionAttachmentRepository.destroy({
    //   where: {
    //     [Op.and]: [
    //       {
    //         problemSolutionId: id,
    //         attachmentId: {
    //           [Op.in]: attachmentIds,
    //         },
    //       },
    //     ],
    //   },
    // });
  }

  async delete(id: number): Promise<void> {
    const problemSolution = await this.problemSolutionRepository.findOneBy({ id });
    problemSolution.deleted = true;
    problemSolution.updatedAt = new Date();
    await this.problemSolutionRepository.save(problemSolution);
    // await this.problemSolutionRepository.update({ deleted: true }, { where: { id } });
  }

  async deleteMany(ids: number[]): Promise<void> {
    // await this.problemSolutionRepository.update({ deleted: true }, { where: { id: ids } });
    const problemSolutions = await this.problemSolutionRepository.findBy({ id: In(ids) });
    await this.problemSolutionRepository.save(
      problemSolutions.map((problemSolution) => {
        problemSolution.deleted = true;
        problemSolution.updatedAt = new Date();
        return problemSolution;
      }),
    );
  }
}
