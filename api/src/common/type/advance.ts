export class Advance {
    id: number;
    siteId: number;
    name: string;
    description: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
}

export class OeeData {
    aPercent: number;
    pPercent: number;
    qPercent: number;
    oeePercent: number;
    totalCount: number;
    runningSeconds: number;
    operatingSeconds: number;
    totalAutoDefects: number;
    totalStopSeconds: number;
    totalOtherDefects: number;
    totalManualDefects: number;
    machineSetupSeconds: number;
    totalBreakdownSeconds: number;
    totalMinorStopSeconds: number;
    totalSpeedLossSeconds: number;
    plannedDowntimeSeconds: number;
}

export class OeeRecord {
    id: string;
    data: OeeData;
    oeeId: number;
    oeeBatchId: number;
    productId: number;
    timestamp: Date;
    timeslot: string;
}

export interface OeeLossResult {
    oeeId: number;
    id: string;
    oeePercent: number;
    ALoss: number;
    PLoss: number;
    QLoss: number;
    timeslot: string;
}