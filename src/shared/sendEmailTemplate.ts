import configuration from 'config/configuration';
import { CreateUserInput } from 'src/modules/users/usersDto/createUserInput';
import { format } from 'date-fns';
import { sendEmails } from './sendEmails';
import { CurrentUserData } from './current_user_dto';
import { replace_email_template } from './replace_email_templates';
import { ServiceType } from 'src/graphql/models/serviceType';

export const sendEmailtemplates = async (
  emailService,
  current_user: CurrentUserData,
  owner_user: CreateUserInput,
  emailAction: string,
  createScheduleData?,
  service_name?: string,
  service_type?: string,
  meeting_link?: string,
  calender_event_link?: string,
  company_det?: any,
  get_exist_schedule?,
) => {
  try {
    const translationsData = {
      //define user
      user_name: current_user?.name,
      user_email: current_user?.email,
      user_phone: current_user?.phone,
      //define schedule
      date: format(new Date(createScheduleData?.date), 'd MMM, yyyy'),
      start_time: createScheduleData?.start_time,
      end_time: createScheduleData?.end_time,
      new_date:
        createScheduleData?.date &&
        format(new Date(createScheduleData?.date), 'd MMM, yyyy'),
      new_start_time:
        createScheduleData?.start_time && createScheduleData?.start_time,
      new_end_time:
        createScheduleData?.end_time && createScheduleData?.end_time,
      old_date:
        get_exist_schedule?.date &&
        format(new Date(get_exist_schedule?.date), 'd MMM, yyyy'),
      old_start_time:
        get_exist_schedule?.start_time && get_exist_schedule?.start_time,
      old_end_time:
        get_exist_schedule?.end_time && get_exist_schedule?.end_time,
      //define service
      service_name: service_name,
      //define meeting and calender event
      meeting_link: meeting_link && meeting_link,
      calender_event_link: calender_event_link && calender_event_link,
      //define owner
      appointmenter_name: owner_user?.first_name + ' ' + owner_user?.last_name,
      appointmenter_email: owner_user?.email,
      appointmenter_number: owner_user?.phone,
      support_email: configuration().supportEmail,
      app_name: configuration().appName,
      //company details
      company_name: company_det?.company_name && company_det?.company_name,
      company_address:
        company_det?.company_address && company_det?.company_address,
      company_number: company_det?.company_phone && company_det?.company_phone,
    };
    //get email template
    const emailTemplateDetlais =
      await emailService.getEmailTemplateByEmailAction(emailAction);
    //console.log(emailTemplateDetlais, service_type);
    //filter email template
    let adminEmailTemplate: any;
    let userEmailTemplate: any;
    if (service_type === ServiceType?.ONLINE) {
      adminEmailTemplate = emailTemplateDetlais.filter(
        (item) =>
          item.side.toLowerCase() === 'admin' &&
          item.type.toLowerCase() === ServiceType?.ONLINE,
      );
      userEmailTemplate = emailTemplateDetlais.filter(
        (item) =>
          item.side.toLowerCase() === 'user' &&
          item.type.toLowerCase() === ServiceType?.ONLINE,
      );
    } else {
      adminEmailTemplate = emailTemplateDetlais.filter(
        (item) =>
          item.side.toLowerCase().includes('admin') &&
          item.type.toLowerCase() === ServiceType?.OFFLINE,
      );
      userEmailTemplate = emailTemplateDetlais.filter(
        (item) =>
          item.side.toLowerCase() === 'user' &&
          item.type.toLowerCase() === ServiceType?.OFFLINE,
      );
    }
    //send email to user
    const userTemplate = replace_email_template(
      userEmailTemplate[0]?.content,
      translationsData,
    );

    const usersendEmailData = {
      emailTo: owner_user?.email,
      emailSub: userEmailTemplate[0].subject,
      emailMsg: userTemplate,
    };
    sendEmails(usersendEmailData);

    //send email to admin
    const adminTemplate = replace_email_template(
      adminEmailTemplate[0]?.content,
      translationsData,
    );

    const adminsendEmailData = {
      emailTo: owner_user?.email,
      emailSub: adminEmailTemplate[0].subject,
      emailMsg: adminTemplate,
    };
    sendEmails(adminsendEmailData);
  } catch (error) {
    // Handle the error here
    console.error('Error in sending email:', error);
    // You can throw the error again if needed
    throw error;
  }
};
