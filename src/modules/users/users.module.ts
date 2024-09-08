import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserResolver } from './users.resolver';
import { UserService } from './users.services';
import { User } from '../../graphql/models/user';
import { JwtService } from '@nestjs/jwt';
import { Email_Template } from 'src/graphql/models/email_templates';
import { EmailTemplateService } from '../emailtemplates/emailtemplateservices';
import { PaymentModule } from '../payments/payment.module';

@Module({
  imports: [TypeOrmModule.forFeature([User, Email_Template]), PaymentModule],
  providers: [UserResolver, UserService, JwtService, EmailTemplateService],
  exports: [UserService],
})
export class UsersModule {}
