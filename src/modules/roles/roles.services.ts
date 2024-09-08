import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRoleInput } from './rolesDto/createRoleInput';
import { Role } from 'src/graphql/models/role';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role) private roleRepository: Repository<Role>,
  ) {}

  async createRole(createRoleData: CreateRoleInput) {
    const roleName = createRoleData?.role_name.toLowerCase();
    const existRole = await this.findByname(roleName);
    if (existRole) {
      throw new ConflictException('Role already registered');
    } else {
      return this.roleRepository.save({
        ...createRoleData,
        role_name: roleName,
      });
    }
  }

  async getRoles() {
    return this.roleRepository.find();
  }

  async getRoleById(id: number) {
    return this.roleRepository.findOne({
      where: { id },
    });
  }

  async updateRole(updateUserData: CreateRoleInput) {
    const roleId = updateUserData?.id;
    if (!roleId) throw new BadRequestException('Role id not provided');
    const userToUpdate = await this.roleRepository.findOne({
      where: { id: roleId },
    });
    Object.assign(userToUpdate, updateUserData);
    await this.roleRepository.save(userToUpdate);
    return userToUpdate;
  }

  // find role by role name
  async findByname(role_name: string): Promise<Role | undefined> {
    const role = await this.roleRepository.findOne({ where: { role_name } });
    return role;
  }
}
