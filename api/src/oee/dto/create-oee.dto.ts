import { PercentSetting } from '../../common/type/percent-settings';
import { OeeTag } from '../../common/type/oee-tag';
import { IsArray, IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { OeeProductDto } from './oee-product.dto';
import { OeeMachineDto } from './oee-machine.dto';
import { OeeOperatorDto } from './oee-operator.dto';

export class CreateOeeDto {
  @IsString()
  readonly oeeCode: string;

  @IsString()
  readonly oeeType: string;

  @IsString()
  readonly location: string;

  @IsString()
  readonly productionName: string;

  @IsString()
  readonly remark: string;

  @IsNumber()
  @Type(() => Number)
  readonly minorStopSeconds: number;

  @IsNumber()
  @Type(() => Number)
  readonly breakdownSeconds: number;

  @IsArray()
  @Type(() => OeeTag)
  readonly tags: OeeTag[];

  @IsArray()
  @IsOptional()
  @Type(() => OeeProductDto)
  readonly oeeProducts: OeeProductDto[];

  @IsArray()
  @IsOptional()
  @Type(() => OeeMachineDto)
  readonly oeeMachines: OeeMachineDto[];

  @IsArray()
  @IsOptional()
  @Type(() => PercentSetting)
  readonly percentSettings: PercentSetting[];

  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  readonly useSitePercentSettings: boolean;

  @IsString()
  readonly timeUnit: string;

  @IsArray()
  @IsOptional()
  readonly operators: OeeOperatorDto[];

}
