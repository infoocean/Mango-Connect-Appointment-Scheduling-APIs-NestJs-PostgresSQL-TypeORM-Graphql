import { ObjectType, Field, Int } from '@nestjs/graphql';
import { GraphQLJSONObject } from 'graphql-type-json';
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'user_payment_options' })
@ObjectType()
export class User_Payment_Option {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number;

  @Column({ length: 255 })
  @Field()
  user_payment_id: string;

  @Column({ length: 100 })
  @Field()
  option_name: string;

  @Column('jsonb')
  @Field(() => GraphQLJSONObject)
  option_value: Record<string, any>[];
}
