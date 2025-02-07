import { OeeMachinePlannedDowntimeEntity } from "src/common/entities/oee-machine-planned-downtime.entity";
import { OeeMachineEntity } from "src/common/entities/oee-machine.entity";
import { OeeProductEntity } from "src/common/entities/oee-product.entity";
import { UserEntity } from "src/common/entities/user.entity";

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
    oeeProducts: OeeProductEntity[];
    oeeMachines: OeeMachineEntity[];
    oeeMachinePlannedDowntime: OeeMachinePlannedDowntimeEntity[];
    operators: UserEntity[];
    workShifts: TransformedWorkShift[];
  }