import { ObjectType, Field, Int } from '@nestjs/graphql';
import { GraphQLJSONObject } from 'graphql-type-json';
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'options' })
@ObjectType()
export class Option {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number;

  @Column({ length: 50 })
  @Field()
  option_key: string;

  @Column('jsonb')
  @Field(() => GraphQLJSONObject)
  option_value: Record<string, any>;
}
