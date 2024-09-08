import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsNumber } from 'class-validator';

@InputType()
export class VerifyOtpInput {
  @Field()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @Field()
  @IsNotEmpty()
  @IsNumber()
  otp: number;
}
