import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DashboardResolver } from './dashboard.resolver';
import { DashboardService } from './dashboard.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Schedule } from 'src/graphql/models/schedule';
import { User } from 'src/graphql/models/user';
import { Schedule_Order } from 'src/graphql/models/schedule_orders';

@Module({
  imports: [TypeOrmModule.forFeature([Schedule, User, Schedule_Order])],
  providers: [DashboardResolver, DashboardService, JwtService],
})
export class DashboardModule {}
