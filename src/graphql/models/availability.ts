import { ObjectType, Field, Int } from '@nestjs/graphql';
import { GraphQLJSONObject } from 'graphql-type-json';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Services } from './services';

@Entity({ name: 'availability' })
@ObjectType()
export class Availability {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number;

  @Column()
  @Field(() => Int)
  userId: number;

  @Column({ length: 50 })
  @Field()
  key: string;

  @Column('jsonb')
  @Field(() => GraphQLJSONObject)
  value: Record<string, any>;

  @Column({ type: 'int', default: 0 })
  @Field(() => Int)
  service_id: number;

  @ManyToOne(() => Services, (service) => service.availability)
  @JoinColumn({ name: 'service_id' })
  service: Services;
}
