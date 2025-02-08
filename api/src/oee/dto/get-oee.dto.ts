import { MachineEntity } from "src/common/entities/machine.entity";
import { OeeMachinePlannedDowntimeEntity } from "src/common/entities/oee-machine-planned-downtime.entity";
import { OeeMachineEntity } from "src/common/entities/oee-machine.entity";
import { OeeProductEntity } from "src/common/entities/oee-product.entity";
import { OeeWorkTimeEntity } from "src/common/entities/oee-work-time.entity";
import { ProductEntity } from "src/common/entities/product.entity";
import { UserEntity } from "src/common/entities/user.entity";
import { WorkShiftEntity } from "src/common/entities/work-shift.entity";
import { OeeTag } from "src/common/type/oee-tag";
import { PercentSetting } from "src/common/type/percent-settings";

export class TransformedWorkShift {
    oeeId: number;
    dayOfWeek: string;
    isDayActive: boolean;
    shifts: {
      id: number;
      shiftNumber: number;
      shiftName: string;
      startTime: string; // รูปแบบ HH:mm
      endTime: string;   // รูปแบบ HH:mm
      isShiftActive: boolean;
    }[];
  }
  
  export class OeeDetailsDto {
    id: number;
    oeeCode: string;
    oeeType: string;
    location: string;
    productionName: string;
    remark?: string;
    imageName?: string;
    minorStopSeconds: number;
    breakdownSeconds: number;
    siteId: number;
    tags?: OeeTag[];
    oeeProducts: OeeProductEntity[];
    oeeMachines: OeeMachineEntity[];
    oeeMachinePlannedDowntime: OeeMachinePlannedDowntimeEntity[];
    workShifts: TransformedWorkShift[];
    operators: UserEntity[];
    updatedAt: Date;
    useSitePercentSettings: boolean;
    percentSettings?: PercentSetting[];
    timeUnit: string;
    activeSecondUnit: boolean;
  }