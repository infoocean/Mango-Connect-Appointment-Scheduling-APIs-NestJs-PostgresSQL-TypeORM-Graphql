import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class SendEmailDto {
  @Field()
  emailTo: string;

  @Field()
  emailSub: string;

  @Field()
  emailMsg: string;
}

export enum EmailActionType {
  REGISTRATION_EMAIL_ACTION = 'registration_email_action',
  FORGOT_PASSWORD_EMAIL_ACTION = 'forgot_password_email_action',
  RESET_PASSWORD_EMAIL_ACTION = 'password_reset_email_action',
  CHANGE_PASSWORD_EMAIL_ACTION = 'change_password_email_action',
  SCHEDULE_EMAIL_ACTION = 'schedule_email_action',
  RESCHEDULE_EMAIL_ACTION = 'reschedule_email_action',
  SCHEDULE_CANCEL_EMAIL_ACTION = 'schedule_cancel_email_action',
  SCHEDULE_DELETE_EMAIL_ACTION = 'schedule_delete_email_action',
  PAYMENT_SUCCESS_EMAIL_ACTION = 'payment_success_email_action',
}
