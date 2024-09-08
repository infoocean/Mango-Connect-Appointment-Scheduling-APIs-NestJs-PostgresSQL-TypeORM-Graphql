import { ObjectType, Field, Float, Int } from '@nestjs/graphql';
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { IsInt, IsNotEmpty, IsString } from 'class-validator';
import { CustomBaseEntity } from 'src/shared/base_entity';
import { ServiceStatus } from './serviceStatus';
import { ServiceType } from './serviceType';
import { Availability } from './availability';
import { Schedule } from './schedule';

@Entity({ name: 'services' })
@ObjectType()
export class Services extends CustomBaseEntity {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number;

  @Column({ length: 100 })
  @Field()
  @IsNotEmpty()
  @IsString()
  name: string;

  @Column()
  @Field(() => Int)
  @IsNotEmpty()
  @IsInt()
  duration: number;

  @Column({ type: 'float', nullable: false })
  @Field(() => Float)
  @IsNotEmpty()
  fee: number;

  @Column({ length: 255 })
  @Field()
  @IsNotEmpty()
  @IsString()
  image: string;

  @Column({ length: 20, default: ServiceType?.ONLINE })
  @Field()
  @IsNotEmpty()
  @IsString()
  type: string;

  @Column({ length: 50, default: ServiceStatus?.ACTIVE })
  @Field()
  @IsNotEmpty()
  @IsString()
  status: string;

  @Column({ type: 'text' })
  @Field()
  @IsNotEmpty()
  @IsString()
  short_description: string;

  @Column()
  @Field(() => Int)
  @IsNotEmpty()
  @IsInt()
  owner_id: number;

  @Column({ type: 'smallint', default: 0 })
  @Field(() => Int)
  is_deleted: number;

  @OneToMany(() => Availability, (availability) => availability.service)
  availability: Availability[];

  @OneToMany(() => Schedule, (schedule) => schedule.service)
  schedule: Schedule[];
}
