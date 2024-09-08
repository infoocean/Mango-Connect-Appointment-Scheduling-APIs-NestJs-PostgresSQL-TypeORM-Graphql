import { Field, InputType, Int } from '@nestjs/graphql';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  ValidateIf,
} from 'class-validator';

@InputType()
export class UpdateUserInput {
  @Field()
  id: number;

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

  @Field({ nullable: true })
  @IsOptional()
  @ValidateIf((obj) => obj.password !== null && obj.password !== undefined)
  @Matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{8,}$/, {
    message:
      'Password must have at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character',
  })
  password?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  status?: number;
}
