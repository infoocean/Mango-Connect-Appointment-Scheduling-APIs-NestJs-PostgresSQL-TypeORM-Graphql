import { Resolver, Query, Args, Int, Mutation, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/middleware/auth.guard';
import { AuthorizationGuard } from 'src/middleware/auth.middleware';
import { AvailabilityService } from './availability.services';
import { Availability } from 'src/graphql/models/availability';
import { CreateAvailabilityInput } from './availabilityDto/availabilityInputDto';
import { GetAvailabilityResponce } from './availabilityDto/availabilityResponceDto';

@Resolver()
export class AvailabilityResolver {
  constructor(private availabilityService: AvailabilityService) {}

  //create Avalibility
  @Mutation(() => Availability)
  @UseGuards(AuthorizationGuard, AuthGuard)
  async createAvalibility(
    @Args('createAvailabilityData')
    createAvalibilityData: CreateAvailabilityInput,
    @Context() context: any,
  ) {
    const current_user = context.req.user;
    return this.availabilityService.createAvailability(
      createAvalibilityData,
      current_user,
    );
  }

  //update  Avalibility
  @Mutation(() => Availability)
  @UseGuards(AuthorizationGuard, AuthGuard)
  async updateAvailability(
    @Args('updateAvalibilityData')
    updateAvailabilityData: CreateAvailabilityInput,
    @Context() context: any,
  ) {
    const current_user = context.req.user;
    return this.availabilityService.updateAvailability(
      updateAvailabilityData,
      current_user,
    );
  }

  //get availability by userid
  @Query(() => GetAvailabilityResponce)
  @UseGuards(AuthorizationGuard)
  async getAvailabilityById(
    @Args('userId', { type: () => Int }) userId: number,
  ) {
    return this.availabilityService.getAvailabilityById(userId);
  }
}
