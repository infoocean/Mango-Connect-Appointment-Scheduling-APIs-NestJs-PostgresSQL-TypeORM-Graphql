import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class GetAvailabilityResponce {
  @Field()
  message: string;

  @Field(() => Int)
  status: number;

  @Field()
  values: string;
}
