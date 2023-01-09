import { Injectable } from '@nestjs/common';
import { CreateProblemSolutionTaskDto } from './dto/create-problem-solution-task.dto';
import { UpdateProblemSolutionTaskDto } from './dto/update-problem-solution-task.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AttachmentEntity } from '../common/entities/attachment-entity';
import { ProblemSolutionTaskEntity } from '../common/entities/problem-solution-task-entity';
import { ProblemSolutionTaskAttachmentEntity } from '../common/entities/problem-solution-task-attachment-entity';
import { FileInfo } from '../common/type/file-info';

@Injectable()
export class ProblemSolutionTaskService {
  constructor(
    @InjectRepository(AttachmentEntity)
    private attachmentRepository: Repository<AttachmentEntity>,
    @InjectRepository(ProblemSolutionTaskEntity)
    private problemSolutionTaskRepository: Repository<ProblemSolutionTaskEntity>,
    @InjectRepository(ProblemSolutionTaskAttachmentEntity)
    private problemSolutionTaskAttachmentRepository: Repository<ProblemSolutionTaskAttachmentEntity>,
  ) {}

  async create(createDto: CreateProblemSolutionTaskDto, fileInfoList: FileInfo[]): Promise<ProblemSolutionTaskEntity> {
    const problemSolutionTask = await this.problemSolutionTaskRepository.save({
      ...createDto,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await this.saveAttachment(problemSolutionTask, fileInfoList);
    return problemSolutionTask;
  }

  async update(
    id: number,
    updateDto: UpdateProblemSolutionTaskDto,
    problemSolutionId: number,
    fileInfoList: FileInfo[],
  ): Promise<ProblemSolutionTaskEntity> {
    const { deletingFiles, ...dto } = updateDto;
    const updatingProblemSolutionTask = await this.problemSolutionTaskRepository.findOneBy({ id, problemSolutionId });
    const problemSolutionTask = await this.problemSolutionTaskRepository.save({
      ...updatingProblemSolutionTask,
      ...dto,
      updatedAt: new Date(),
    });

    if (deletingFiles && deletingFiles.length > 0) {
      await this.problemSolutionTaskAttachmentRepository
        .createQueryBuilder()
        .delete()
        .where('problemSolutionTaskId = :problemSolutionTaskId', { problemSolutionTaskId: id })
        .andWhere('attachmentId in (:ids)', { ids: deletingFiles })
        .execute();
    }

    await this.saveAttachment(problemSolutionTask, fileInfoList);
    return problemSolutionTask;
  }

  private async saveAttachment(problemSolutionTask: ProblemSolutionTaskEntity, fileInfoList: FileInfo[]) {
    if (fileInfoList) {
      for (const fileInfo of fileInfoList) {
        const attachment = await this.attachmentRepository.save({
          name: fileInfo.name,
          fileName: fileInfo.fileName,
          length: fileInfo.length,
          mime: fileInfo.mime,
          createdAt: new Date(),
        });

        await this.problemSolutionTaskAttachmentRepository.save({
          problemSolutionTask,
          attachment,
          groupName: 'attachments',
          createdAt: new Date(),
        });
      }
    }
  }

  async delete(ids: number[], problemSolutionId: number): Promise<void> {
    await this.problemSolutionTaskRepository
      .createQueryBuilder()
      .delete()
      .where('problemSolutionId = :problemSolutionId', { problemSolutionId: problemSolutionId })
      .andWhere('id in (:ids)', { ids: ids })
      .execute();
  }

  // async updateFiles(id: number, name: string, images: Express.Multer.File[]): Promise<void> {
  //   const problemSolutionTask = await this.problemSolutionTaskRepository.findOneBy({ id });
  //   for (const image of images) {
  //     const attachmentName = crypto.randomUUID();
  //     const imageUrl = await this.contentService.saveAttachment(attachmentName, image.buffer, image.mimetype);
  //     const attachment = await this.attachmentRepository.save({
  //       name: image.originalname,
  //       url: imageUrl,
  //       length: image.buffer.length,
  //       mime: image.mimetype,
  //       createdAt: new Date(),
  //     });
  //
  //     await this.problemSolutionTaskAttachmentRepository.save({
  //       problemSolutionTask,
  //       attachment,
  //       groupName: name,
  //       createdAt: new Date(),
  //     });
  //   }
  //
  //   // for (let image of images) {
  //   //   const attachmentName = uuid();
  //   //   const imageUrl = await this.contentService.saveAttachment(attachmentName, image.buffer, image.mimetype);
  //   //   const attachment = await this.attachmentRepository.create({
  //   //     name: image.originalname,
  //   //     url: imageUrl,
  //   //     length: image.buffer.length,
  //   //     mime: image.mimetype,
  //   //   });
  //   //
  //   //   await this.problemSolutionTaskAttachmentRepository.create({
  //   //     problemSolutionTaskId: id,
  //   //     attachmentId: attachment.id,
  //   //     groupName: name,
  //   //   });
  //   // }
  // }

  // async deleteFiles(id: number, attachmentIds: number[]): Promise<void> {
  //   await this.problemSolutionTaskAttachmentRepository
  //     .createQueryBuilder()
  //     .delete()
  //     .where('problemSolutionTaskId = :problemSolutionTaskId', { problemSolutionTaskId: id })
  //     .andWhere('attachmentId in (:ids)', { ids: attachmentIds })
  //     .execute();
  //
  //   // await this.problemSolutionTaskAttachmentRepository.destroy({
  //   //   where: {
  //   //     [Op.and]: [
  //   //       {
  //   //         problemSolutionTaskId: id,
  //   //         attachmentId: {
  //   //           [Op.in]: attachmentIds,
  //   //         },
  //   //       },
  //   //     ],
  //   //   },
  //   // });
  // }
}
