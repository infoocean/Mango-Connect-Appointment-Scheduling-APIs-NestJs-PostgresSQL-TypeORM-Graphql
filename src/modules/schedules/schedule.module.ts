import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { ScheduleService } from './schedule.services';
import { ScheduleResolver } from './schedule.resolver';
import { Schedule } from 'src/graphql/models/schedule';
import { EmailTemplateService } from '../emailtemplates/emailtemplateservices';
import { Email_Template } from 'src/graphql/models/email_templates';
import { UsersModule } from '../users/users.module';
import { OptionModule } from '../options/option.module';
import { OptionService } from '../options/option.services';
import { Option } from 'src/graphql/models/options';
import { ServiceModule } from '../services/services.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Schedule, Email_Template, Option]),
    UsersModule,
    OptionModule,
    ServiceModule,
  ],
  providers: [
    ScheduleResolver,
    ScheduleService,
    JwtService,
    EmailTemplateService,
    OptionService,
  ],
  exports: [ScheduleService],
})
export class ScheduleModule {}
