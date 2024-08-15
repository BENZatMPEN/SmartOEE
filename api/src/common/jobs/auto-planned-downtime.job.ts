import { Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { InjectRepository } from "@nestjs/typeorm";
import { OeeMachinePlannedDowntimeEntity } from "../entities/oee-machine-planned-downtime.entity";
import { In, Repository } from "typeorm";
import { OeeBatchEntity } from "../entities/oee-batch.entity";
import { OeeMachineEntity } from "../entities/oee-machine.entity";
import { PlannedDowntimeEntity } from "../entities/planned-downtime.entity";
import { OEE_BATCH_STATUS_BREAKDOWN, OEE_BATCH_STATUS_RUNNING } from "../constant";
import { OeeBatchService } from "src/oee-batch/oee-batch.service";


@Injectable()
export class AutoPlannedDowntimeJob {
    private readonly logger = new Logger(AutoPlannedDowntimeJob.name);
    constructor(
        @InjectRepository(OeeMachinePlannedDowntimeEntity)
        private oeeMachinePlannedDowntimeRepository: Repository<OeeMachinePlannedDowntimeEntity>,
        @InjectRepository(OeeBatchEntity)
        private oeeBatchRepository: Repository<OeeBatchEntity>,
        @InjectRepository(OeeMachineEntity)
        private oeeMachineRepository: Repository<OeeMachineEntity>,
        @InjectRepository(PlannedDowntimeEntity)
        private plannedDowntimeRepository: Repository<PlannedDowntimeEntity>,
        private readonly oeeBatchService: OeeBatchService,
    ) { }

    @Cron('0/1 * * * *')
    async handleCron() {
        const oeeBatches = await this.getOeeBatchStarting();
        for (const oeeBatch of oeeBatches) {
            this.setPlannedDowntime(oeeBatch)
        }
    }

    private async getOeeBatchStarting(): Promise<OeeBatchEntity[]> {
        const oeeBatch = await this.oeeBatchRepository.find({
            where: {
                status: In([OEE_BATCH_STATUS_RUNNING, OEE_BATCH_STATUS_BREAKDOWN]),
            },
            order: {
                createdAt: 'DESC',
            },
        });
        return oeeBatch;
    }

    private async setPlannedDowntime(oeeBatch: OeeBatchEntity): Promise<void> {
        const currentDate = new Date();
        const threeMinutesAgo = new Date(currentDate.getTime() - 1 * 60 * 1000);
        const threeMinutesLater = new Date(currentDate.getTime() + 1 * 60 * 1000);
        const oeeMachinePlannedDowntimes = await this.oeeMachinePlannedDowntimeRepository
            .createQueryBuilder("plannedDowntime")
            .where("plannedDowntime.oeeId = :oeeId", { oeeId: oeeBatch.oeeId })
            .andWhere("plannedDowntime.fixTime = :fixTime", { fixTime: true })
            .andWhere("TIME(plannedDowntime.startDate) > TIME(:threeMinutesAgo)", { threeMinutesAgo })
            .andWhere("TIME(plannedDowntime.startDate) < TIME(:threeMinutesLater)", { threeMinutesLater })
            .getMany();

        for (const oeeMachinePlannedDowntime of oeeMachinePlannedDowntimes) {
            //validate oeeMachine
            const oeeMachine = await this.oeeMachineRepository.findOne({ where: { id: oeeMachinePlannedDowntime.oeeMachineId, oeeId: oeeMachinePlannedDowntime.oeeId } });
            if (!oeeMachine) {
                this.logger.error(`oeeMachine not found for oeeMachinePlannedDowntimeId: ${oeeMachinePlannedDowntime.id}`);
                continue;
            }
            //find plannedDowntime by plannedDownTimeId
            const plannedDowntimeInfo = await this.plannedDowntimeRepository.findOne({ where: { id: oeeMachinePlannedDowntime.plannedDownTimeId } });
            if (!plannedDowntimeInfo) {
                this.logger.error(`plannedDowntimeInfo not found for oeeMachinePlannedDowntimeId: ${oeeMachinePlannedDowntime.id}`);
                continue;
            }

            let diffTime = 999;
            if (oeeMachinePlannedDowntime.fixTime) {
                //find diff time between startDate and endDate
                const startDate = new Date(oeeMachinePlannedDowntime.startDate);
                const endDate = new Date(oeeMachinePlannedDowntime.endDate);

                const diffMilliseconds = endDate.getTime() - startDate.getTime();
                diffTime = Math.floor(diffMilliseconds / 1000);
                if (diffTime < 0) {
                    this.logger.error(`diffTime is negative for oeeMachinePlannedDowntimeId: ${oeeMachinePlannedDowntime.id}`);
                    continue;
                }
            }
            // create plannedDowntimeDto
            const initialPlannedDownTime = {
                timing: oeeMachinePlannedDowntime.fixTime ? 'timer' : 'manual',
                name: plannedDowntimeInfo.name,
                type: plannedDowntimeInfo.type,
                oeeBatchId: oeeBatch.id,
                seconds: diffTime
            }
            //create plannedDowntime
            await this.oeeBatchService.createPlannedDowntime(oeeBatch.id, initialPlannedDownTime);
            this.logger.log(`plannedDowntime created for oeeMachinePlannedDowntimeId: ${oeeMachinePlannedDowntime.id}`);

        }
    }
}