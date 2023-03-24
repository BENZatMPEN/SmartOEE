import { Logger } from '@nestjs/common';

export function logBatch(logger: Logger, batchId: number, oeeCode: string, message: string) {
  logger.log(`[${oeeCode} - ${batchId}] ${message}`);
}
