import { RoleSetting } from '../../common/type/role-setting';

export class UpdateRoleDto {
  readonly id: number;
  readonly name: string;
  readonly remark: string;
  readonly roles: RoleSetting[];
}
