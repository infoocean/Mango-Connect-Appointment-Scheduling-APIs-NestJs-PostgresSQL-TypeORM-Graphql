import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderResolver } from './order.resolver';
import { JwtService } from '@nestjs/jwt';
import { Schedule_Order } from 'src/graphql/models/schedule_orders';
import { OrderService } from './order.services';
import { EmailTemplateService } from '../emailtemplates/emailtemplateservices';
import { Email_Template } from 'src/graphql/models/email_templates';
import { UsersModule } from '../users/users.module';
import { ScheduleModule } from '../schedules/schedule.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Schedule_Order, Email_Template]),
    UsersModule,
    ScheduleModule,
  ],
  providers: [OrderResolver, OrderService, JwtService, EmailTemplateService],
  exports: [OrderService],
})
export class OrderModule {}
