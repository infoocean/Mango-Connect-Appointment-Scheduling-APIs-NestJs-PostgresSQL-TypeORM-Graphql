import { ObjectType, Field, Int } from '@nestjs/graphql';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Services } from './services';
import { User } from './user';
import { Schedule_Order } from './schedule_orders';
import { IsNotEmpty, IsInt, IsString, IsOptional } from 'class-validator';

@Entity({ name: 'schedules' })
@ObjectType()
export class Schedule {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number;

  @Column()
  @Field(() => Int)
  @IsNotEmpty()
  @IsInt()
  user_id: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  @Field()
  @IsNotEmpty()
  date: Date;

  @Column({ type: 'time' })
  @Field()
  @IsString()
  @IsNotEmpty()
  start_time: string;

  @Column({ type: 'time' })
  @Field()
  @IsNotEmpty()
  @IsString()
  end_time: string;

  @Column({ length: 20 })
  @Field()
  @IsNotEmpty()
  @IsString()
  type: string;

  @Column({ default: 'active' })
  @Field()
  @IsNotEmpty()
  @IsString()
  status: string;

  @Column({ default: 0 })
  @Field(() => Int)
  @IsNotEmpty()
  @IsInt()
  appreciate_id: number;

  @Column({ default: 0 })
  @Field(() => Int)
  @IsNotEmpty()
  @IsInt()
  service_id: number;

  @Column({ default: 0 })
  @Field(() => Int)
  @IsNotEmpty()
  @IsInt()
  parent_id: number;

  @Column({ length: 100, default: null, nullable: true })
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  meeting_url: string;

  @Column({ length: 100, default: null, nullable: true })
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  event_id: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  @Field()
  created_at: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  @Field()
  updated_at: Date;

  @ManyToOne(() => Services, (service) => service.schedule)
  @JoinColumn({ name: 'service_id' })
  @Field(() => Services)
  service: Services;

  @ManyToOne(() => User, (user) => user.schedule)
  @JoinColumn({ name: 'user_id' })
  @Field(() => User)
  user: User;

  @OneToMany(() => Schedule_Order, (schedule_order) => schedule_order.schedule)
  schedule_order: Schedule_Order;
}
