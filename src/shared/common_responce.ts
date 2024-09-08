import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class commonResponse {
  @Field({ nullable: true })
  success?: boolean;

  @Field({ nullable: true })
  message?: string;

  @Field({ nullable: true })
  status?: number;

  @Field({ nullable: true })
  data?: string;
}
