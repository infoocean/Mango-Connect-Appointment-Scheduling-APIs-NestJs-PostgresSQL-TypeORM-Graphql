import { InputType, Field, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsInt, IsEnum } from 'class-validator';
import { ScheduleStatus } from './scheduleStatus';
import { CreateScheduleInput } from './scheduleCreateInput';

@InputType()
export class UpdateScheduleInput extends CreateScheduleInput {
  @Field(() => Int)
  @IsNotEmpty()
  @IsInt()
  schedule_id: number;

  @Field({
    description:
      'Indicates the current status of the schedule: active, canceled, deleted, or rescheduled. Please use the terms "active", "canceled", "deleted", or "rescheduled" accordingly.',
  })
  @IsEnum(ScheduleStatus, {
    message:
      'Invalid schedule status. Must be "active", "canceled", "deleted", or "rescheduled".',
  })
  status: ScheduleStatus;
}
