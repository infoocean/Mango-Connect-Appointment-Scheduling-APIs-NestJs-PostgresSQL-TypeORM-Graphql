import { InputType, Field, Int } from '@nestjs/graphql';
import {
  IsNotEmpty,
  IsEmail,
  IsString,
  Matches,
  IsNumber,
} from 'class-validator';

@InputType()
export class CreateUserInput {
  @Field({ nullable: true })
  id?: number;

  @Field()
  @IsNotEmpty()
  @IsString()
  first_name: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  last_name: string;

  @Field()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  phone: string;

  @Field()
  @IsNotEmpty()
  @Matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{8,}$/, {
    message:
      'Password must have at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character',
  })
  password: string;

  @Field(() => Int)
  @IsNotEmpty()
  @IsNumber()
  role_id: number;

  @Field(() => Int, { defaultValue: 0 })
  status: number;

  @Field(() => Int, { defaultValue: 0 })
  is_verified: number;
}
