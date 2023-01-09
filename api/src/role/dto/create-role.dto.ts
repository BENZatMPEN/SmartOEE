import { RoleSetting } from '../../common/type/role-setting';
import { IsArray, IsNumber, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateRoleDto {
  @IsString()
  readonly name: string;

  @IsString()
  readonly remark: string;

  @IsArray()
  @Type(() => RoleSetting)
  readonly roles: RoleSetting[];

  @IsNumber()
  @Type(() => Number)
  readonly siteId: number;
}
