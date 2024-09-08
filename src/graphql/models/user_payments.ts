import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'user_payments' })
@ObjectType()
export class User_Payment {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number;

  @Column()
  @Field(() => Int)
  user_id: number;

  @Column({ length: 100 })
  @Field()
  customer_id: string;

  @Column({ length: 100 })
  @Field()
  payment_profile_id: string;
}
