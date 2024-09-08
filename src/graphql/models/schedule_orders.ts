import { ObjectType, Field, Int, Float } from '@nestjs/graphql';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user';
import { Schedule } from './schedule';

@Entity({ name: 'schedule_orders' })
@ObjectType()
export class Schedule_Order {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number;

  @Column()
  @Field(() => Int)
  schedule_id: number;

  @Column()
  @Field(() => Int)
  user_id: number;

  @Column({ length: 200, nullable: true })
  @Field({ nullable: true })
  transaction_id: string | null;

  @Column({ type: 'float', nullable: true })
  @Field(() => Float, { nullable: true })
  amount: number | null;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  @Field()
  payment_date: Date;

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

  @Column({ length: 20, default: null })
  @Field({ nullable: true })
  status: string | null;

  @Column({ length: 100, nullable: true })
  @Field({ nullable: true })
  refund_id: string | null;

  @Column({ type: 'float', nullable: true })
  @Field(() => Float, { nullable: true })
  refund_amount: number | null;

  @ManyToOne(() => User, (user) => user.scheduleOrders)
  @JoinColumn({ name: 'user_id' })
  @Field(() => User)
  user: User[];

  @ManyToOne(() => Schedule, (schedule) => schedule.schedule_order)
  @JoinColumn({ name: 'schedule_id' })
  @Field(() => Schedule)
  schedule: Schedule[];
}
