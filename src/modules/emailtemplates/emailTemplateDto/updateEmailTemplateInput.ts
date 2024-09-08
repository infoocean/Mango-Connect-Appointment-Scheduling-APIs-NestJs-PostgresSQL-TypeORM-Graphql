import { InputType, Field, Int } from '@nestjs/graphql';
import { IsInt, IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class updateEmailTemplateInput {
  @Field(() => Int)
  @IsNotEmpty()
  @IsInt()
  id: number;

  @Field()
  @IsNotEmpty()
  @IsString()
  subject: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  email_action: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  content: string;
}
