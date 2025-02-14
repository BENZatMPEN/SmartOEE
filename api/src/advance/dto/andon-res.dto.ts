import { AndonColumnEntity } from "src/common/entities/andon-column.entity";
import { OeeStatusItem } from "src/common/type/oee-status";

export class AndonResDto {
    running: number;
    breakdown: number;
    ended: number;
    standby: number;
    mcSetup: number;
    oees: OeeStatusItem[];
    columns: AndonColumnEntity[];
}