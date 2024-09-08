import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleResolver } from './roles.resolver';
import { RoleService } from './roles.services';
import { Role } from 'src/graphql/models/role';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [TypeOrmModule.forFeature([Role])],
  providers: [RoleResolver, RoleService, JwtService],
})
export class RoleModule {}
