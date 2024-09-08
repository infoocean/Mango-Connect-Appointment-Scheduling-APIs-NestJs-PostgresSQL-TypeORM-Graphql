import { InputType, Field, Int } from '@nestjs/graphql';
import {
  IsNotEmpty,
  IsInt,
  IsDate,
  IsString,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { ScheduleType } from './scheduleType';

@InputType()
export class CreateScheduleInput {
  @Field(() => Int)
  @IsNotEmpty()
  @IsInt()
  user_id: number;

  @Field()
  @IsNotEmpty()
  @IsDate()
  date: Date;

  @Field()
  @IsString()
  @IsNotEmpty()
  start_time: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  end_time: string;

  @Field({
    description:
      'Indicates whether the schedule type is free or paid. Please use the terms "free" or "paid" respectively.',
  })
  @IsEnum(ScheduleType, {
    message: 'Invalid schedule type. Must be "free" or "paid".',
  })
  type: ScheduleType;

  @Field(() => Int, { nullable: true })
  appreciate_id: number;

  @Field(() => Int)
  @IsNotEmpty()
  @IsInt()
  service_id: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  meeting_url?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  event_id?: string;
}
