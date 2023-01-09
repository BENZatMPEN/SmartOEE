import { OeeProductEntity } from 'src/common/entities/oee-product-entity';
import { OeeMachineEntity } from '../../common/entities/oee-machine-entity';
import { PercentSetting } from '../../common/type/percent-settings';
import { OeeTag } from '../../common/type/oee-tag';
import { IsArray, IsBoolean, IsNumber, IsString } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { Column, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { OeeEntity } from '../../common/entities/oee-entity';
import { MachineEntity } from '../../common/entities/machine-entity';

export class OeeMachineDto {
  @IsNumber()
  @Type(() => Number)
  id?: number;

  @IsNumber()
  @Type(() => Number)
  oeeId: number;

  @IsNumber()
  @Type(() => Number)
  machineId: number;
}
