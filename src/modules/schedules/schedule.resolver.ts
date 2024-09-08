import {
  Resolver,
  Query,
  Args,
  Mutation,
  Int,
  Context,
  Subscription,
} from '@nestjs/graphql';
import { CreateScheduleInput } from './scheduleDto/scheduleCreateInput';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/middleware/auth.guard';
import { AuthorizationGuard } from 'src/middleware/auth.middleware';
import { Schedule } from 'src/graphql/models/schedule';
import { ScheduleService } from './schedule.services';
import { PubSub } from 'graphql-subscriptions';
import { UpdateScheduleInput } from './scheduleDto/scheduleUpdateInput';
import { commonResponse } from 'src/shared/common_responce';

const pubSub = new PubSub();
@Resolver()
export class ScheduleResolver {
  constructor(private scheduleService: ScheduleService) {}

  //create schedule (appointment)
  @Mutation(() => Schedule)
  @UseGuards(AuthorizationGuard, AuthGuard)
  async createSchedule(
    @Args('createScheduleData') createScheduleData: CreateScheduleInput,
    @Context() context: any,
  ) {
    const current_user = context.req.user;
    pubSub.publish('schedule created', {
      scheeduleCreated: createScheduleData,
    });
    return this.scheduleService.createSchedule(
      createScheduleData,
      current_user,
    );
  }

  //update schedule by schedule id
  @Mutation(() => Schedule)
  @UseGuards(AuthorizationGuard, AuthGuard)
  async updateScheduleById(
    @Args('updateScheduleData') updateScheduleData: UpdateScheduleInput,
    @Context() context: any,
  ) {
    const current_user = context.req.user;
    return this.scheduleService.updateScheduleById(
      updateScheduleData,
      current_user,
    );
  }

  //delete schedule by schedule id
  @Mutation(() => commonResponse)
  @UseGuards(AuthorizationGuard, AuthGuard)
  async deleteScheduleById(
    @Args('schedule_id', { type: () => Int }) schedule_id: number,
    @Context() context: any,
  ) {
    const current_user = context.req.user;
    return this.scheduleService.deleteScheduleById(schedule_id, current_user);
  }

  // get schedules by user id
  @Query(() => [Schedule])
  @UseGuards(AuthorizationGuard, AuthGuard)
  async getSchedulesByUserId(
    @Args('userId', { type: () => Int }) userId: number,
  ) {
    return this.scheduleService.getSchedulesByUserId(userId);
  }

  // get schedules by service id
  @Query(() => String)
  @UseGuards(AuthorizationGuard, AuthGuard)
  async getSchedulesByServiceId(
    @Args('service_id', { type: () => Int }) service_id: number,
    @Args('status', { type: () => String, nullable: true }) status?: string,
    @Args('page', { type: () => Int, nullable: true, defaultValue: 1 })
    page: number = 1,
    @Args('limit', { type: () => Int, nullable: true, defaultValue: 10 })
    limit: number = 10,
  ) {
    return this.scheduleService.getSchedulesByServiceId(
      service_id,
      status,
      page,
      limit,
    );
  }

  //get all schedules of services
  @Query(() => String)
  @UseGuards(AuthorizationGuard, AuthGuard)
  async getAllSchedulesOfServices(
    @Args('service_id', { type: () => Int, nullable: true })
    service_id?: number,
    @Args('status', { type: () => String, nullable: true }) status?: string,
    @Args('page', { type: () => Int, nullable: true, defaultValue: 1 })
    page: number = 1,
    @Args('limit', { type: () => Int, nullable: true, defaultValue: 10 })
    limit: number = 10,
  ) {
    return this.scheduleService.getAllSchedulesOfServices(
      service_id,
      status,
      page,
      limit,
    );
  }

  // get schedules details by id
  @Query(() => [Schedule])
  @UseGuards(AuthorizationGuard, AuthGuard)
  async getScheduleDetailsById(@Args('id', { type: () => Int }) id: number) {
    return this.scheduleService.getScheduleDetailsById(id);
  }

  // get schedules by date
  @Query(() => [Schedule])
  @UseGuards(AuthorizationGuard, AuthGuard)
  async getSchedulesByDate(@Args('date', { type: () => Date }) date: Date) {
    return this.scheduleService.getSchedulsByDate(date);
  }

  // get all schedules
  @Query(() => [Schedule])
  @UseGuards(AuthorizationGuard, AuthGuard)
  async getAllSchedules() {
    return this.scheduleService.getAllScheduls();
  }

  //subscription to send notifications
  @Subscription(() => Schedule)
  scheduleCreated() {
    return pubSub.asyncIterator('schedule created');
  }
}
