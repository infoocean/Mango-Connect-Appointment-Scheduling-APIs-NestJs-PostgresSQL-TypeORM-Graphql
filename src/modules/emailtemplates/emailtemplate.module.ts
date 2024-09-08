import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Email_Template } from 'src/graphql/models/email_templates';
import { EmailTemplateResolver } from './emailtemplate.resolver';
import { EmailTemplateService } from './emailtemplateservices';

@Module({
  imports: [TypeOrmModule.forFeature([Email_Template])],
  providers: [EmailTemplateResolver, EmailTemplateService, JwtService],
})
export class EmailTemplateModule {}
