import { IsNumber, IsDate, IsBoolean, IsInt, IsString, IsEnum, IsOptional } from "class-validator";
import { MachineEntity } from "src/common/entities/machine.entity";
import { OeeBatchAEntity } from "src/common/entities/oee-batch-a.entity";
import { OeeBatchPEntity } from "src/common/entities/oee-batch-p.entity";
import { OeeBatchQEntity } from "src/common/entities/oee-batch-q.entity";
import { OeeEntity } from "src/common/entities/oee.entity";
import { PlanningEntity } from "src/common/entities/planning.entity";
import { ProductEntity } from "src/common/entities/product.entity";
import { UserEntity } from "src/common/entities/user.entity";
import { StartType, EndType } from "src/common/enums/batchTypes";
import { OeeStats } from "src/common/type/oee-stats";
import { OeeBatchMcState } from "src/common/type/oee-status";

export class FindLatestBatchOeeDto {
    @IsNumber()
    id: number;

    @IsDate()
    startDate: Date;

    @IsDate()
    endDate: Date;

    @IsOptional()
    @IsDate()
    batchStartedDate: Date;

    @IsOptional()
    @IsDate()
    batchStoppedDate: Date;

    @IsBoolean()
    toBeStopped: boolean;

    @IsInt()
    minorStopSeconds: number;

    @IsInt()
    breakdownSeconds: number;

    @IsNumber()
    standardSpeedSeconds: number;

    @IsInt()
    plannedQuantity: number;

    @IsInt()
    targetQuantity: number;

    @IsString()
    lotNumber: string;

    oeeStats: OeeStats;

    product: ProductEntity;

    machines: MachineEntity[];

    @IsString()
    status: string;

    @IsOptional()
    @IsString()
    userEmail: string;

    @IsInt()
    siteId: number;

    @IsOptional()
    @IsInt()
    planningId: number;

    planning: PlanningEntity;

    @IsInt()
    oeeId: number;

    oee: OeeEntity;

    aParams: OeeBatchAEntity[];

    pParams: OeeBatchPEntity[];

    qParams: OeeBatchQEntity[];

    @IsDate()
    createdAt: Date;

    @IsDate()
    updatedAt: Date;

    mcState: OeeBatchMcState;

    @IsEnum(StartType)
    startType: StartType;

    @IsEnum(EndType)
    endType: EndType;

    @IsOptional()
    @IsInt()
    operatorId: number;

    operator: UserEntity;
}
