import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'email_templates' })
@ObjectType()
export class Email_Template {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number;

  @Column({ length: 150 })
  @Field()
  subject: string;

  @Column({ length: 150 })
  @Field()
  email_action: string;

  @Column({ type: 'text', nullable: true })
  @Field(() => String, { nullable: true })
  content: string;

  @Column({ length: 50, default: 'user' })
  @Field(() => String, {
    description:
      'Indicates whether the email template type is admin side or user side.',
  })
  side: string;

  @Column({ length: 50, default: 'online' })
  @Field(() => String, {
    description:
      'Indicates whether the email template type is online or offline.',
  })
  type: string;

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
}
