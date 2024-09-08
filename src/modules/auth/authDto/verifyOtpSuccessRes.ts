import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class VerifyOtpSuccessResponse {
  @Field({ nullable: true })
  messag?: string;

  @Field({ nullable: true })
  status?: number;

  @Field({ nullable: true })
  token?: string;
}
