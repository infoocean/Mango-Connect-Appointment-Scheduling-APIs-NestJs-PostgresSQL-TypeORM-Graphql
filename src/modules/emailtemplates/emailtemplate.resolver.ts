import { Resolver, Query, Args, Mutation, Int } from '@nestjs/graphql';
import { updateEmailTemplateInput } from './emailTemplateDto/updateEmailTemplateInput';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/middleware/auth.guard';
import { AuthorizationGuard } from 'src/middleware/auth.middleware';
import { EmailTemplateService } from './emailtemplateservices';
import { Email_Template } from 'src/graphql/models/email_templates';

@Resolver(() => Email_Template)
export class EmailTemplateResolver {
  constructor(private emailTemplateService: EmailTemplateService) {}

  //update email templates
  @Mutation(() => Email_Template)
  @UseGuards(AuthorizationGuard, AuthGuard)
  async updateEmailTemplate(
    @Args('updateEmailTemplateData')
    updateEmailTemplateData: updateEmailTemplateInput,
  ) {
    return this.emailTemplateService.updateEmailTemplate(
      updateEmailTemplateData,
    );
  }

  //get email templates
  @Query(() => [Email_Template])
  @UseGuards(AuthorizationGuard, AuthGuard)
  async getEmailTemplates() {
    return this.emailTemplateService.getEmailTemplates();
  }

  //get email template by id
  @Query(() => Email_Template)
  @UseGuards(AuthorizationGuard, AuthGuard)
  async getEmailTemplateByid(@Args('id', { type: () => Int }) id: number) {
    return this.emailTemplateService.getEmailTemplateByid(id);
  }

  //get email template by email action
  @Query(() => Email_Template)
  @UseGuards(AuthorizationGuard, AuthGuard)
  async getEmailTemplateByEmailAction(
    @Args('email_action', { type: () => String }) email_action: string,
  ) {
    return this.emailTemplateService.getEmailTemplateByEmailAction(
      email_action,
    );
  }
}
