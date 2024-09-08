import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsString, Matches } from 'class-validator';

@InputType()
export class ResetPasswordInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  token: string;

  @Field()
  @IsNotEmpty()
  @Matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{8,}$/, {
    message:
      'Password must have at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character',
  })
  password: string;
}
