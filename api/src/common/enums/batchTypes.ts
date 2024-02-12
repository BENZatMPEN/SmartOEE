export enum StartType {
    AUTO = 'AUTO',//Auto Start Batch
    EXTERNAL = 'EXTERNAL',//'External Start Batch',
    MANUAL = 'MANUAL'//Manual Start Batch
};

export enum EndType {
    AUTO_PLANNING = 'AUTO_PLANNING', //Auto End Batch (Planning Immediately)
    AUTO_FG = 'AUTO_FG', //Auto End Batch (FG)'
    AUTO_ACTUAL_FG = 'AUTO_ACTUAL_FG', //Auto End Batch (Actual FG)'
    MANUAL = 'MANUAL', //Manual End Batch'
    EXTERNAL = 'EXTERNAL', //External End Batch
};
