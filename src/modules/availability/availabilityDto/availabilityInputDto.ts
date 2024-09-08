import { InputType, Field, Int } from '@nestjs/graphql';
import {
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { GraphQLJSONObject } from 'graphql-type-json';

@InputType()
export class CreateAvailabilityInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  key: string;

  @Field(() => GraphQLJSONObject)
  @IsNotEmpty()
  @IsObject()
  value: Record<string, any>[];

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  service_id?: number;
}
