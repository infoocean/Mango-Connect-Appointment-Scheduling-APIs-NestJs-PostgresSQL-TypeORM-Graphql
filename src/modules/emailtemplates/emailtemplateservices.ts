import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { updateEmailTemplateInput } from './emailTemplateDto/updateEmailTemplateInput';
import { Email_Template } from 'src/graphql/models/email_templates';

@Injectable()
export class EmailTemplateService {
  emailTemplateToUpdate: any;
  constructor(
    @InjectRepository(Email_Template)
    private emailTemplateRepository: Repository<Email_Template>,
  ) {}

  async updateEmailTemplate(
    updateUpdateEmailTemplateData: updateEmailTemplateInput,
  ) {
    const emailTemplateToUpdate = await this.getEmailTemplateByid(
      updateUpdateEmailTemplateData?.id,
    );
    Object.assign(emailTemplateToUpdate, updateUpdateEmailTemplateData);
    await this.emailTemplateRepository.save(emailTemplateToUpdate);
    return emailTemplateToUpdate;
  }

  async getEmailTemplates() {
    try {
      return await this.emailTemplateRepository.find();
    } catch (error) {
      throw new InternalServerErrorException(
        'An internal error occurred',
        error.message,
      );
    }
  }

  async getEmailTemplateByid(id: number) {
    try {
      const emailTemplate = await this.emailTemplateRepository.findOne({
        where: { id },
      });
      return emailTemplate;
    } catch (error) {
      throw new InternalServerErrorException(
        'An internal error occurred',
        error.message,
      );
    }
  }

  async getEmailTemplateByEmailAction(email_action: string) {
    try {
      const emailTemplate = await this.emailTemplateRepository.find({
        where: { email_action },
      });
      return emailTemplate;
    } catch (error) {
      throw new InternalServerErrorException(
        'An internal error occurred',
        error.message,
      );
    }
  }
}
