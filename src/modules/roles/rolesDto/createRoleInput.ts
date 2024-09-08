import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class CreateRoleInput {
  @Field({ nullable: true })
  id?: number;

  @Field()
  @IsNotEmpty()
  @IsString()
  role_name: string;
}
