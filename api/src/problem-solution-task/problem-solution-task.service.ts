import { Injectable } from '@nestjs/common';
import { CreateProblemSolutionTaskDto } from './dto/create-problem-solution-task.dto';
import { UpdateProblemSolutionTaskDto } from './dto/update-problem-solution-task.dto';
import { ContentService } from '../common/content/content.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attachment } from '../common/entities/attachment';
import { ProblemSolutionTask } from '../common/entities/problem-solution-task';
import { ProblemSolutionTaskAttachment } from '../common/entities/problem-solution-task-attachment';
import * as _ from 'lodash';
import { v4 as uuid } from 'uuid';

@Injectable()
export class ProblemSolutionTaskService {
  constructor(
    @InjectRepository(Attachment)
    private attachmentRepository: Repository<Attachment>,
    @InjectRepository(ProblemSolutionTask)
    private problemSolutionTaskRepository: Repository<ProblemSolutionTask>,
    @InjectRepository(ProblemSolutionTaskAttachment)
    private problemSolutionTaskAttachmentRepository: Repository<ProblemSolutionTaskAttachment>,
    private readonly contentService: ContentService,
  ) {}

  create(createDto: CreateProblemSolutionTaskDto): Promise<ProblemSolutionTask> {
    return this.problemSolutionTaskRepository.save({
      ...createDto,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // const problemSolutionTask = await this.problemSolutionTaskRepository.create({
    //   ...createDto,
    // });
    //
    // return problemSolutionTask.reload();
  }

  async update(id: number, updateDto: UpdateProblemSolutionTaskDto): Promise<ProblemSolutionTask> {
    const updatingProblemSolutionTask = await this.problemSolutionTaskRepository.findOneBy({ id });
    return this.problemSolutionTaskRepository.save({
      ..._.assign(updatingProblemSolutionTask, updateDto),
      updatedAt: new Date(),
    });
    // const problemSolutionTask = await this.problemSolutionTaskRepository.findByPk(id);
    // await problemSolutionTask.update({
    //   ...updateDto,
    // });
    //
    // return problemSolutionTask.reload();
  }

  async delete(ids: number[], problemSolutionId: number): Promise<void> {
    await this.problemSolutionTaskRepository
      .createQueryBuilder()
      .delete()
      .where('problemSolutionId = :problemSolutionId', { problemSolutionId: problemSolutionId })
      .andWhere('id in (:ids)', { ids: ids })
      .execute();
    // await this.problemSolutionTaskRepository.destroy({
    //   where: {
    //     [Op.and]: [
    //       {
    //         problemSolutionId: problemSolutionId,
    //         id: {
    //           [Op.in]: ids,
    //         },
    //       },
    //     ],
    //   },
    // });
    // return null;
  }

  async updateFiles(id: number, name: string, images: Express.Multer.File[]): Promise<void> {
    const problemSolutionTask = await this.problemSolutionTaskRepository.findOneBy({ id });
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

      await this.problemSolutionTaskAttachmentRepository.save({
        problemSolutionTask,
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
    //   await this.problemSolutionTaskAttachmentRepository.create({
    //     problemSolutionTaskId: id,
    //     attachmentId: attachment.id,
    //     groupName: name,
    //   });
    // }
  }

  async deleteFiles(id: number, attachmentIds: number[]): Promise<void> {
    await this.problemSolutionTaskAttachmentRepository
      .createQueryBuilder()
      .delete()
      .where('problemSolutionTaskId = :problemSolutionTaskId', { problemSolutionTaskId: id })
      .andWhere('attachmentId in (:ids)', { ids: attachmentIds })
      .execute();

    // await this.problemSolutionTaskAttachmentRepository.destroy({
    //   where: {
    //     [Op.and]: [
    //       {
    //         problemSolutionTaskId: id,
    //         attachmentId: {
    //           [Op.in]: attachmentIds,
    //         },
    //       },
    //     ],
    //   },
    // });
  }
}
