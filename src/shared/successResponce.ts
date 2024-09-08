import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class SuccessResponse {
  @Field({ nullable: true })
  message?: string;

  @Field({ nullable: true })
  status?: number;

  @Field({ nullable: true })
  token?: string;
}
