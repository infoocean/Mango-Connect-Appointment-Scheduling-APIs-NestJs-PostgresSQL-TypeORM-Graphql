import { Field, Int, Float, InputType } from '@nestjs/graphql';
import { IsDate, IsInt, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

@InputType()
export class CreateOrderInput {
  @Field(() => Int)
  @IsNotEmpty()
  @IsInt()
  schedule_id: number;

  @Field(() => Int)
  @IsNotEmpty()
  @IsInt()
  user_id: number;

  @Field(() => Float)
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @Field()
  @IsNotEmpty()
  @IsDate()
  payment_date?: Date;

  @Field()
  @IsNotEmpty()
  transaction_id: string;

  @Field({ nullable: true })
  @IsOptional()
  status: string | null;
}

@InputType()
export class UpdateOrderInput {
  @Field(() => Int)
  @IsNotEmpty()
  @IsInt()
  order_id: number;

  @Field()
  @IsNotEmpty()
  transaction_id: string;

  @Field()
  @IsNotEmpty()
  status: string;
}
