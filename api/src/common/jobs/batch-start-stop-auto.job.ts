import { Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { CreateOeeBatchDto } from "src/oee-batch/dto/create-oee-batch.dto";
import { OeeBatchService } from "src/oee-batch/oee-batch.service";
import { PlanningService } from "src/planning/planning.service";
import { EndType } from "../enums/batchTypes";


@Injectable()
export class BatchStartAutoJob {
    private readonly logger = new Logger(BatchStartAutoJob.name);

    constructor(
        private readonly planingService: PlanningService,
        private readonly oeeBatchService: OeeBatchService
    ) { }

    //corn every 1 minute
    // @Cron('0/1 * * * * *')
    @Cron('0/1 * * * *')
    async handleCron() {
        this.logger.log('BatchAutoJob');
        // //start batch auto by planning
        await this.startBatchAutoByPlanning();
        // //start batch auto by batch
        await this.startBatchAutoByBatch();


        //stop batch auto by auto planning
        await this.stopBatchAutByAutoPlaning();
        //stop batch auto by auto fg
        await this.stopBatchAutoByAutoFg();
        //stop batch auto by actual fg
        await this.stopBatchAutoByActualFg();
    }

    //implement stopBatchAutoByActualFg
    async stopBatchAutoByActualFg() {
        // console.log('stopBatchAutoByActualFg');
        //find batch stop type auto
        const oeeBatches = await this.oeeBatchService.findTypeAutoStopByActualFg();
        for (const batch of oeeBatches) {
            const mcState= batch.mcState;
            if (mcState.total >= batch.plannedQuantity && mcState.stopSeconds > batch.minorStopSeconds) {
                const toBeStopped = true;
                //condition is status === minor stop
                await this.oeeBatchService.update1(batch.id, {
                    toBeStopped,
                });
                this.logger.log(`Batch auto stopped for batch id: ${batch.id}`);
            }
        }
    }

    //implement stopBatchAutoByAutoFg
    async stopBatchAutoByAutoFg() {
        //find batch stop type auto
        const oeeBatches = await this.oeeBatchService.findTypeAutoStop(EndType.AUTO_FG);
        for (const batch of oeeBatches) {
            const mcState= batch.mcState;
            if (mcState.stopSeconds > batch.minorStopSeconds) {
                const toBeStopped = true;
                //condition is status === minor stop
                await this.oeeBatchService.update1(batch.id, {
                    toBeStopped,
                });
                this.logger.log(`Batch auto stopped for batch id: ${batch.id}`);
            }
        }
    }

    async stopBatchAutByAutoPlaning() {
        //find batch stop type auto
        const oeeBatches = await this.oeeBatchService.findTypeAutoStop(EndType.AUTO_PLANNING);
        for (const batch of oeeBatches) {
            console.log('batch', batch);
            const toBeStopped = true;
            await this.oeeBatchService.update1(batch.id, {
                toBeStopped,
            });
            this.logger.log(`Batch auto stopped for batch id: ${batch.id}`);
        }
    }

    async startBatchAutoByBatch() {
        // console.log('startBatchAutoByBatch');
        //find batch start type auto
        const oeeBatches = await this.oeeBatchService.findTypeAutoStart();
        for (const batch of oeeBatches) {
            await this.oeeBatchService.startBatch(batch.id);
            this.logger.log(`Batch auto started for batch id: ${batch.id}`);
        }

    }

    async startBatchAutoByPlanning() {
        const plannings = await this.planingService.findAutoStart();
        for (const planning of plannings) {
            const { oeeId } = planning;
            //init create dto
            const createDto: CreateOeeBatchDto = {
                startDate: planning.startDate,
                endDate: planning.endDate,
                plannedQuantity: planning.plannedQuantity,
                oeeId: planning.oeeId,
                productId: planning.productId,
                lotNumber: planning.lotNumber,
                operatorId: planning.operatorId,
                planningId: planning.id,
                startType: planning.startType,
                endType: planning.endType,

            };
            const oeeBatch = await this.oeeBatchService.findByPlanningId(planning.id);
            if (!oeeBatch) {
                const oeeBatch = await this.oeeBatchService.create(Number(oeeId), createDto, 'system-auto-start@mail.com');
                await this.oeeBatchService.startBatch(oeeBatch.id);
                this.logger.log(`Batch auto started for planning id: ${planning.id}`);
            }
        }
    }
}