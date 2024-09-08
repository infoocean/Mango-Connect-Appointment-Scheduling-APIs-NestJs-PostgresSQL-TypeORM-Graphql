import { Resolver, Args, Mutation, Context, Int, Query } from '@nestjs/graphql';
import { AuthGuard } from 'src/middleware/auth.guard';
import { AuthorizationGuard } from 'src/middleware/auth.middleware';
import { UseGuards } from '@nestjs/common';
import { ServicesServices } from './services.service';
import {
  CreateServiceInput,
  UpdateServiceInput,
} from './servicesDto/createServiceInput';
import { commonResponse } from 'src/shared/common_responce';

@Resolver()
export class ServiceResolver {
  constructor(private servicesService: ServicesServices) {}

  //create service
  @Mutation(() => commonResponse)
  @UseGuards(AuthorizationGuard, AuthGuard)
  async createService(
    @Context() context: any,
    @Args('createServiceData') createServiceData: CreateServiceInput,
  ): Promise<commonResponse> {
    const current_user = context.req.user;
    return this.servicesService.createService(createServiceData, current_user);
  }

  //update  service
  @Mutation(() => commonResponse)
  @UseGuards(AuthorizationGuard, AuthGuard)
  async updateService(
    @Args('updateServiceData') updateOrderData: UpdateServiceInput,
    @Context() context: any,
  ) {
    const current_user = context.req.user;
    return this.servicesService.updateService(updateOrderData, current_user);
  }

  //get all services
  @Query(() => String)
  @UseGuards(AuthorizationGuard, AuthGuard)
  async getServices(
    @Context() context: any,
    @Args({ name: 'page', type: () => Int, defaultValue: 1 }) page: number,
    @Args({ name: 'limit', type: () => Int, defaultValue: 10 }) limit: number,
    @Args('search', { nullable: true }) search?: string,
    @Args('sortBy', { nullable: true }) sortBy?: string,
    @Args('sortOrder', { nullable: true, defaultValue: 'ASC' })
    sortOrder?: 'ASC' | 'DESC',
    @Args('filterBy', { nullable: true }) filterBy?: string,
    @Args('filterValue', { nullable: true }) filterValue?: string,
  ) {
    const current_user = context.req.user;
    return this.servicesService.getServices(
      page,
      limit,
      search,
      sortBy,
      sortOrder,
      filterBy,
      filterValue,
      current_user,
    );
  }

  //get service details by id
  @Query(() => String)
  @UseGuards(AuthorizationGuard, AuthGuard)
  async getServiceDetailsById(@Args('id', { type: () => Int }) id: number) {
    return this.servicesService.getServiceDetailsById(id);
  }

  //single delete or bulk delete service soft delete
  @Query(() => commonResponse)
  @UseGuards(AuthorizationGuard, AuthGuard)
  async deleteService(@Args('ids', { type: () => [Int] }) ids: number[]) {
    return this.servicesService.deleteService(ids);
  }

  //update only status
  @Query(() => commonResponse)
  @UseGuards(AuthorizationGuard, AuthGuard)
  async updateServiceStatus(
    @Args('id', { type: () => Int }) id: number,
    @Args('status', { type: () => String }) status: string,
  ) {
    return this.servicesService.updateServiceStatus(id, status);
  }
}
