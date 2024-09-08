import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import configuration from 'config/configuration';
import { Email_Template } from 'src/graphql/models/email_templates';
import { Option } from 'src/graphql/models/options';
import { Role } from 'src/graphql/models/role';
import {
  forgotPasswordEmailTemplate,
  pasymentEmailTemplate,
  resetPasswordEmailTemplate,
  scheduleCancledEmailTemplate,
  scheduleEmailTemplate,
  scheduleUpdatedEmailTemplate,
  welcomeEmailTemplate,
} from 'src/helper/templates/defaultTemplates';
import { Repository } from 'typeorm';
import { User } from './graphql/models/user';

@Injectable()
export class MigrationDataService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Option)
    private readonly siteOptionRepository: Repository<Option>,
    @InjectRepository(Email_Template)
    private readonly emailTemplateRepository: Repository<Email_Template>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async insertInitialRole() {
    try {
      const existingRoles = await this.roleRepository.find();
      if (existingRoles.length === 0) {
        await this.roleRepository.query(
          'TRUNCATE TABLE roles RESTART IDENTITY;',
        );
        // Insert initial data
        const rolesToInsert = [{ role_name: 'admin' }, { role_name: 'user' }];
        await this.roleRepository.save(rolesToInsert);
      }
    } catch (error) {
      throw error;
    }
  }

  async insertInitialSiteOption() {
    try {
      const existingOptions = await this.siteOptionRepository.find();
      if (existingOptions.length === 0) {
        await this.siteOptionRepository.query(
          'TRUNCATE TABLE options RESTART IDENTITY;',
        );
        // Insert initial site options
        const siteOptionsToInsert = [
          {
            option_key: 'org_stripe_keys',
            option_value: {
              stripe_sk: configuration().stripe_pk,
              stripe_pk: configuration().stripe_sk,
            },
          },
          {
            option_key: 'org_logo_favicon_title',
            option_value: {
              org_logo: '',
              org_favicon: '',
              org_title: 'Mango Connect',
            },
          },
        ];
        await this.siteOptionRepository.save(siteOptionsToInsert);
      }
    } catch (error) {
      throw error;
    }
  }

  async insertInitialEmailTemplates() {
    try {
      const existingEmailTemplates = await this.emailTemplateRepository.find();
      if (existingEmailTemplates.length === 0) {
        await this.siteOptionRepository.query(
          'TRUNCATE TABLE email_templates RESTART IDENTITY;',
        );
        // Insert initial email templates
        const emailTemplatesToInsert = [
          {
            subject: `Registration successfully from ${
              configuration().appName
            } ✅`,
            email_action: 'registration_email_template',
            content: `${welcomeEmailTemplate}`,
          },
          {
            subject: `One time password (OTP) from ${
              configuration().appName
            } ✅`,
            email_action: 'forgot_password_email_template',
            content: `${forgotPasswordEmailTemplate}`,
          },
          {
            subject: `Password reset successfully from ${
              configuration().appName
            } ✅`,
            email_action: 'password_reset_email_template',
            content: `${resetPasswordEmailTemplate}`,
          },
          {
            subject: `Your schesule successfully from ${
              configuration().appName
            } ✅`,
            email_action: 'schedule_email_template',
            content: `${scheduleEmailTemplate}`,
          },
          {
            subject: `Payment successfully from ${configuration().appName} ✅`,
            email_action: 'payment_success_email_template',
            content: `${pasymentEmailTemplate}`,
          },
          {
            subject: `Your schesule updated successfully from ${
              configuration().appName
            } ✅`,
            email_action: 'schedule_update_email_template',
            content: `${scheduleUpdatedEmailTemplate}`,
          },
          {
            subject: `Your schesule canceled from ${
              configuration().appName
            } ✅`,
            email_action: 'schedule_cancel_email_template',
            content: `${scheduleCancledEmailTemplate}`,
          },
        ];
        await this.emailTemplateRepository.save(emailTemplatesToInsert);
      }
    } catch (error) {
      throw error;
    }
  }

  async insertInitialUser() {
    try {
      const existingUsers = await this.userRepository.find();
      if (existingUsers.length === 0) {
        await this.siteOptionRepository.query(
          'TRUNCATE TABLE users RESTART IDENTITY;',
        );
        // Insert initial email templates
        const userToInsert = [
          {
            first_name: 'Govind ',
            last_name: 'namdev',
            email: 'govind@mangoitsolutions.com',
            phone: '1231231234',
            password: '',
            role_id: 1,
            is_verified: 1,
            status: 1,
          },
        ];
        await this.userRepository.save(userToInsert);
      }
    } catch (error) {
      throw error;
    }
  }
}
