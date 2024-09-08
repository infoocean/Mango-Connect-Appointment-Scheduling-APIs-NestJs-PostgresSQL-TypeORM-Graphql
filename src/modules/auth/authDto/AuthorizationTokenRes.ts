import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class AuthorizationTokenResponse {
  @Field({ nullable: true })
  message?: string;

  @Field({ nullable: true })
  status?: number;

  @Field({ nullable: true })
  token?: string;

  @Field({ nullable: true })
  token_type?: string;
}
