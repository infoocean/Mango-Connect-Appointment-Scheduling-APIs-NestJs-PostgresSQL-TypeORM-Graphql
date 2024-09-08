import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { User } from './user';

@Entity({ name: 'roles' })
@ObjectType()
export class Role {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number;

  @Column({ length: 30 })
  @Field()
  role_name: string;

  @OneToMany(() => User, (user) => user.role)
  users: User[];
}
