import { Resolver, Query, Args, Int, Mutation } from '@nestjs/graphql';
import { User } from '../../graphql/models/user';
import { CreateRoleInput } from './rolesDto/createRoleInput';
import { RoleService } from './roles.services';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/middleware/auth.guard';
import { AuthorizationGuard } from 'src/middleware/auth.middleware';
import { Role } from 'src/graphql/models/role';

@Resolver(() => User)
export class RoleResolver {
  constructor(private roleService: RoleService) {}

  //create role
  @Mutation(() => Role)
  @UseGuards(AuthorizationGuard, AuthGuard)
  async createRole(@Args('createRoleData') createRoleData: CreateRoleInput) {
    return this.roleService.createRole(createRoleData);
  }

  //update  role
  @Mutation(() => Role)
  @UseGuards(AuthorizationGuard, AuthGuard)
  async updateRole(@Args('updateRoleData') updateRoleData: CreateRoleInput) {
    return this.roleService.updateRole(updateRoleData);
  }

  //get role details by id
  @Query(() => Role, { nullable: true })
  @UseGuards(AuthorizationGuard, AuthGuard)
  async getRoleById(@Args('id', { type: () => Int }) id: number) {
    return this.roleService.getRoleById(id);
  }

  //get roles
  @Query(() => [Role])
  @UseGuards(AuthorizationGuard, AuthGuard)
  async getRoles() {
    return this.roleService.getRoles();
  }
}
