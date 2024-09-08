import { Resolver, Query, Args, Int } from '@nestjs/graphql';
import { DashboardService } from './dashboard.service';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/middleware/auth.guard';
import { AuthorizationGuard } from 'src/middleware/auth.middleware';

@Resolver()
export class DashboardResolver {
  constructor(private dashboardService: DashboardService) {}

  //get dashboard data
  @Query(() => String)
  @UseGuards(AuthorizationGuard, AuthGuard)
  async getDashboardData() {
    return await this.dashboardService.getDashboardData();
  }

  //get dashboard data by user
  @Query(() => String)
  @UseGuards(AuthorizationGuard, AuthGuard)
  async getDashboardDataByUserId(@Args('id', { type: () => Int }) id: number) {
    return await this.dashboardService.getDashboardDataByUserId(id);
  }
}
