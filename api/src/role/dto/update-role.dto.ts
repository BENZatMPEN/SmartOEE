import { RoleSetting } from '../../common/type/role-setting';
import { IsArray, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateRoleDto {
  @IsString()
  readonly name: string;

  @IsString()
  readonly remark: string;

  @IsArray()
  @Type(() => RoleSetting)
  readonly roles: RoleSetting[];
}
