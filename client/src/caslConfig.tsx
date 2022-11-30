import { Ability, AbilityBuilder, AbilityClass } from '@casl/ability';
import { RoleAction, RoleSetting, RoleSubject } from './@types/role';

export type AppAbility = Ability<[RoleAction, RoleSubject]>;
export const AppAbility = Ability as AbilityClass<AppAbility>;

export default function defineRulesFor(roles: RoleSetting[]) {
  const { rules } = new AbilityBuilder(AppAbility);
  return rules;
}

export function buildAbilityFor(roles: RoleSetting[]): AppAbility {
  return new AppAbility(defineRulesFor(roles), {
    // https://casl.js.org/v5/en/guide/subject-type-detection
    // @ts-ignore
    // detectSubjectType: (object) => object!.type,
  });
}
