import { Injectable } from '@nestjs/common';
import { CreateProblemSolutionDto } from './dto/create-problem-solution.dto';
import { FilterProblemSolutionDto } from './dto/filter-problem-solution.dto';
import { UpdateProblemSolutionDto } from './dto/update-problem-solution.dto';
import { PagedLisDto } from '../common/dto/paged-list.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { AttachmentEntity } from '../common/entities/attachment-entity';
import { ProblemSolutionEntity } from '../common/entities/problem-solution-entity';
import { ProblemSolutionAttachmentEntity } from '../common/entities/problem-solution-attachment-entity';
import { FileInfo } from '../common/type/file-info';

@Injectable()
export class ProblemSolutionService {
  constructor(
    @InjectRepository(AttachmentEntity)
    private attachmentRepository: Repository<AttachmentEntity>,
    @InjectRepository(ProblemSolutionEntity)
    private problemSolutionRepository: Repository<ProblemSolutionEntity>,
    @InjectRepository(ProblemSolutionAttachmentEntity)
    private problemSolutionAttachmentRepository: Repository<ProblemSolutionAttachmentEntity>,
  ) {}

  async findPagedList(filterDto: FilterProblemSolutionDto): Promise<PagedLisDto<ProblemSolutionEntity>> {
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

  findAll(siteId: number): Promise<ProblemSolutionEntity[]> {
    return this.problemSolutionRepository.findBy({ siteId, deleted: false });
    // return this.problemSolutionRepository.findAll({ where: { deleted: false } });
  }

  findById(id: number, siteId: number): Promise<ProblemSolutionEntity> {
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

  async create(
    createDto: CreateProblemSolutionDto,
    siteId: number,
    beforeProjectChartImageInfoList: FileInfo[],
    beforeProjectImageInfoList: FileInfo[],
    afterProjectChartImageInfoList: FileInfo[],
    afterProjectImageInfoList: FileInfo[],
  ): Promise<ProblemSolutionEntity> {
    const { approvedByUserId, ...dto } = createDto;
    const problemSolution = await this.problemSolutionRepository.save({
      ...dto,
      siteId,
      approvedByUserId: approvedByUserId === -1 ? null : approvedByUserId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await this.saveAttachment('beforeProjectChartImages', problemSolution, beforeProjectChartImageInfoList);
    await this.saveAttachment('beforeProjectImages', problemSolution, beforeProjectImageInfoList);
    await this.saveAttachment('afterProjectChartImages', problemSolution, afterProjectChartImageInfoList);
    await this.saveAttachment('afterProjectImages', problemSolution, afterProjectImageInfoList);

    return problemSolution;
  }

  async update(
    id: number,
    updateDto: UpdateProblemSolutionDto,
    siteId: number,
    beforeProjectChartImageInfoList: FileInfo[],
    beforeProjectImageInfoList: FileInfo[],
    afterProjectChartImageInfoList: FileInfo[],
    afterProjectImageInfoList: FileInfo[],
  ): Promise<ProblemSolutionEntity> {
    const { approvedByUserId, deletingAttachments, ...dto } = updateDto;
    const updatingProblemSolution = await this.problemSolutionRepository.findOneBy({ id, siteId });
    const problemSolution = await this.problemSolutionRepository.save({
      ...updatingProblemSolution,
      ...dto,
      approvedByUserId: approvedByUserId === -1 ? null : approvedByUserId,
      updatedAt: new Date(),
    });

    if (deletingAttachments && deletingAttachments.length > 0) {
      await this.problemSolutionAttachmentRepository
        .createQueryBuilder()
        .delete()
        .where('problemSolutionId = :problemSolutionId', { problemSolutionId: id })
        .andWhere('attachmentId in (:ids)', { ids: deletingAttachments })
        .execute();
    }

    await this.saveAttachment('beforeProjectChartImages', problemSolution, beforeProjectChartImageInfoList);
    await this.saveAttachment('beforeProjectImages', problemSolution, beforeProjectImageInfoList);
    await this.saveAttachment('afterProjectChartImages', problemSolution, afterProjectChartImageInfoList);
    await this.saveAttachment('afterProjectImages', problemSolution, afterProjectImageInfoList);

    return problemSolution;
  }

  private async saveAttachment(key: string, problemSolution: ProblemSolutionEntity, fileInfoList: FileInfo[]) {
    if (fileInfoList) {
      for (const fileInfo of fileInfoList) {
        const attachment = await this.attachmentRepository.save({
          name: fileInfo.name,
          fileName: fileInfo.fileName,
          length: fileInfo.length,
          mime: fileInfo.mime,
          createdAt: new Date(),
        });

        await this.problemSolutionAttachmentRepository.save({
          problemSolution,
          attachment,
          groupName: key,
          createdAt: new Date(),
        });
      }
    }
  }

  async delete(id: number, siteId: number): Promise<void> {
    const problemSolution = await this.problemSolutionRepository.findOneBy({ id, siteId });
    problemSolution.deleted = true;
    problemSolution.updatedAt = new Date();
    await this.problemSolutionRepository.save(problemSolution);
  }

  async deleteMany(ids: number[], siteId: number): Promise<void> {
    const problemSolutions = await this.problemSolutionRepository.findBy({ id: In(ids), siteId });
    await this.problemSolutionRepository.save(
      problemSolutions.map((problemSolution) => {
        problemSolution.deleted = true;
        problemSolution.updatedAt = new Date();
        return problemSolution;
      }),
    );
  }
}
