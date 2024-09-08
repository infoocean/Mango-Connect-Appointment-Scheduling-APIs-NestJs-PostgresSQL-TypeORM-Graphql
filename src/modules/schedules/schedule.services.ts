import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateScheduleInput } from './scheduleDto/scheduleCreateInput';
import { In, Repository } from 'typeorm';
import { Schedule } from 'src/graphql/models/schedule';
import { EmailTemplateService } from '../emailtemplates/emailtemplateservices';
import { UpdateScheduleInput } from './scheduleDto/scheduleUpdateInput';
import { ScheduleStatus } from './scheduleDto/scheduleStatus';
import { UserService } from '../users/users.services';
import { CreateUserInput } from '../users/usersDto/createUserInput';
import { CurrentUserData } from 'src/shared/current_user_dto';
import { sendEmailtemplates } from 'src/shared/sendEmailTemplate';
import { EmailActionType } from 'src/shared/sendEmail.dto';
import { v4 as uuidv4 } from 'uuid';
import { OptionService } from '../options/option.services';
import { google } from 'googleapis';
import { Optionkeys } from '../options/optionDto/option_keys';
import { ServicesServices } from '../services/services.service';
import { ServiceType } from 'src/graphql/models/serviceType';

@Injectable()
export class ScheduleService {
  constructor(
    @InjectRepository(Schedule)
    private scheduleRepository: Repository<Schedule>,
    private readonly emailService: EmailTemplateService,
    private readonly userService: UserService,
    private readonly optionService: OptionService,
    private readonly servicesService: ServicesServices,
  ) {}

  //create a new schedule
  async createSchedule(
    createScheduleData: CreateScheduleInput,
    current_user: CurrentUserData,
  ) {
    const scheduleExists = await this.scheduleRepository.findOne({
      where: {
        date: createScheduleData?.date,
        start_time: createScheduleData?.start_time,
        end_time: createScheduleData?.end_time,
        status: In([ScheduleStatus.ACTIVE]),
      },
    });
    if (scheduleExists) {
      return new BadRequestException('Schedule already exists!');
    }
    try {
      //get service details
      const service_det: any = await this.servicesService.findServiceById(
        createScheduleData?.service_id,
      );
      //get owner(organizer) details
      const owner_user: CreateUserInput = await this.userService.getUserById(
        service_det?.owner_id,
      );
      //get conpany details
      const compamy_det: any = await this.optionService.findOptionByOptionKey(
        Optionkeys?.ORGANIZATION_DETAILS,
      );
      //check service is online or ofline
      if (service_det?.type === ServiceType?.ONLINE) {
        //create schedule event and meeting
        const [startHours, startMinutes] = createScheduleData?.start_time
          .split(':')
          .map(Number);
        const [endHours, endMinutes] = createScheduleData?.end_time
          .split(':')
          .map(Number);
        const startDate = new Date(createScheduleData?.date);
        startDate.setHours(startHours, startMinutes, 0, 0);

        const endDate = new Date(createScheduleData?.date);
        endDate.setHours(endHours, endMinutes, 0, 0);
        const eventDetails = {
          summary: `Schedule from ${compamy_det?.option_value?.company_name} - ${service_det?.name}`,
          description: `Here is the schedule for <b>${service_det?.name}</b> service. Please refer to the following details to ensure timely and efficient completion of your requested service.`,
          startTime: startDate,
          endTime: endDate,
          attendeeEmail: {
            owner_email: owner_user.email,
            user_email: current_user.email,
          },
        };
        const event_det: any =
          await this.createcalenderEventWithMeeting(eventDetails);
        //send emails
        const emailAction = EmailActionType.SCHEDULE_EMAIL_ACTION;
        await sendEmailtemplates(
          this.emailService,
          current_user,
          owner_user,
          emailAction,
          createScheduleData,
          service_det?.name,
          service_det?.type,
          event_det?.hangoutLink,
          event_det?.htmlLink,
          null,
          null,
        );
        createScheduleData = {
          ...createScheduleData,
          meeting_url: event_det?.hangoutLink,
          event_id: event_det?.id,
        };
      } else {
        const emailAction = EmailActionType.SCHEDULE_EMAIL_ACTION;
        await sendEmailtemplates(
          this.emailService,
          current_user,
          owner_user,
          emailAction,
          createScheduleData,
          service_det?.name,
          service_det?.type,
          null,
          null,
          compamy_det?.option_value,
          null,
        );
      }
      return await this.scheduleRepository.save(createScheduleData);
    } catch (error) {
      throw new InternalServerErrorException(
        'An enternal server error occurred',
        error.message,
      );
    }
  }

  //update a schedule from here rescheduled schedule, canceled schedule, deleted schedule
  async updateScheduleById(
    updateScheduleData: UpdateScheduleInput,
    current_user: CurrentUserData,
  ) {
    const scheduleToUpdate = await this.findScheduleById(
      updateScheduleData?.schedule_id,
    );
    if (!scheduleToUpdate) {
      throw new BadRequestException('Schedule not found');
    }
    try {
      //get service details
      const service_det: any = await this.servicesService.findServiceById(
        updateScheduleData?.service_id,
      );
      //get owner(organizer) details
      const owner_user = await this.userService.getUserById(
        service_det?.owner_id,
      );
      //get conpany details
      const compamy_det: any = await this.optionService.findOptionByOptionKey(
        Optionkeys?.ORGANIZATION_DETAILS,
      );
      // schedule is rescheduled
      if (ScheduleStatus.RESCHEDULED === updateScheduleData?.status) {
        const scheduleExists = await this.scheduleRepository.findOne({
          where: {
            date: updateScheduleData?.date,
            start_time: updateScheduleData?.start_time,
            end_time: updateScheduleData?.end_time,
            status: In([ScheduleStatus.ACTIVE]),
          },
        });
        if (scheduleExists)
          return new BadRequestException('Schedule already exists');
        //get existing Schedule by id and update
        const get_exist_schedule = await this.findScheduleById(
          updateScheduleData?.schedule_id,
        );
        get_exist_schedule.status = ScheduleStatus.RESCHEDULED;
        //create new Schedule
        const ScheduleData = {
          user_id: updateScheduleData?.user_id,
          date: updateScheduleData?.date,
          start_time: updateScheduleData?.start_time,
          end_time: updateScheduleData?.end_time,
          type: updateScheduleData?.type,
          service_id: updateScheduleData?.service_id,
          appreciate_id: get_exist_schedule.id,
          parent_id:
            get_exist_schedule?.parent_id === 0
              ? get_exist_schedule.id
              : get_exist_schedule?.parent_id,
        };
        //create a new Schedule
        const create_new_schedule =
          await this.scheduleRepository.save(ScheduleData);
        //get email action
        const emailAction = EmailActionType.RESCHEDULE_EMAIL_ACTION;
        //check if schedule is online or offline
        if (service_det?.type === ServiceType?.ONLINE) {
          //rescheduled exsisting calender event and meeting
          const [startHours, startMinutes] = updateScheduleData?.start_time
            .split(':')
            .map(Number);
          const [endHours, endMinutes] = updateScheduleData?.end_time
            .split(':')
            .map(Number);
          const startDate = new Date(updateScheduleData?.date);
          startDate.setHours(startHours, startMinutes, 0, 0);
          const endDate = new Date(updateScheduleData?.date);
          endDate.setHours(endHours, endMinutes, 0, 0);
          const eventDetails = {
            summary: `Schedule from ${compamy_det?.option_value?.company_name} - ${service_det?.name}`,
            description: `Here is the schedule for <b>${service_det?.name}</b> service. Please refer to the following details to ensure timely and efficient completion of your requested service.`,
            startTime: startDate,
            endTime: endDate,
            attendeeEmail: {
              owner_email: owner_user.email,
              user_email: current_user.email,
            },
          };
          const event_det: any = await this.rescheduleCalendarEventWithMeeting(
            get_exist_schedule?.event_id,
            eventDetails,
          );
          //send email
          await sendEmailtemplates(
            this.emailService,
            current_user,
            owner_user,
            emailAction,
            create_new_schedule,
            service_det?.name,
            service_det?.type,
            event_det?.hangoutLink,
            event_det?.htmlLink,
            null,
            get_exist_schedule,
          );
          //remove meeting url and event id from existing schedule
          get_exist_schedule.meeting_url = null;
          get_exist_schedule.event_id = null;
          //add  meeting url and event id new create schedule
          create_new_schedule.meeting_url = event_det?.hangoutLink;
          create_new_schedule.event_id = event_det?.id;
        } else {
          await sendEmailtemplates(
            this.emailService,
            current_user,
            owner_user,
            emailAction,
            create_new_schedule,
            service_det?.name,
            service_det?.type,
            null,
            null,
            compamy_det?.option_value,
            get_exist_schedule,
          );
        }
        //update existing schedule
        Object.assign(scheduleToUpdate, get_exist_schedule);
        await this.scheduleRepository.save(scheduleToUpdate);
        //update new crfeated schedule
        await this.scheduleRepository.save(create_new_schedule);
        return create_new_schedule;
      } else {
        //get email template
        const emailAction = EmailActionType.SCHEDULE_CANCEL_EMAIL_ACTION;
        if (service_det?.type === ServiceType?.ONLINE) {
          //cancel schedule event and meeting
          await this.cancelCalendarEvent(scheduleToUpdate?.event_id);
          //send email
          await sendEmailtemplates(
            this.emailService,
            current_user,
            owner_user,
            emailAction,
            scheduleToUpdate,
            service_det?.name,
            service_det?.type,
          );
          updateScheduleData = {
            ...updateScheduleData,
            meeting_url: null,
            event_id: null,
          };
        } else {
          await sendEmailtemplates(
            this.emailService,
            current_user,
            owner_user,
            emailAction,
            scheduleToUpdate,
            service_det?.name,
            service_det?.type,
          );
        }
        Object.assign(scheduleToUpdate, updateScheduleData);
        await this.scheduleRepository.save(scheduleToUpdate);
        return scheduleToUpdate;
      }
    } catch (error) {
      throw new InternalServerErrorException(
        'An enternal server error occurred',
        error.message,
      );
    }
  }

  //delete a schedule
  async deleteScheduleById(schedule_id: number, current_user: CurrentUserData) {
    console.log(current_user);
    const scheduleToUpdate = await this.findScheduleById(schedule_id);
    if (!scheduleToUpdate) {
      throw new BadRequestException('Schedule not found');
    }
    await this.scheduleRepository.delete(schedule_id);
    return {
      success: true,
      message: 'schedule deleted successfully',
      status: 200,
    };
  }

  //get a schedule details by id
  async getScheduleDetailsById(id: number) {
    try {
      return this.scheduleRepository.find({
        where: { id },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'An enternal server error occurred',
        error.message,
      );
    }
  }

  //get schedules by user id
  async getSchedulesByUserId(userId: number) {
    try {
      return await this.scheduleRepository.find({
        where: { user_id: userId },
        relations: ['service'],
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'An enternal server error occurred',
        error.message,
      );
    }
  }

  //get schedules by service id
  async getSchedulesByServiceId(
    service_id: number,
    status?: string,
    page: number = 1,
    limit: number = 10,
  ) {
    try {
      const query = this.scheduleRepository
        .createQueryBuilder('schedules')
        .where('schedules.service_id = :service_id', { service_id });
      if (status) {
        query.andWhere('schedules.status = :status', { status });
      }
      const [schedules, total] = await query
        .skip((page - 1) * limit)
        .take(limit)
        .getManyAndCount();
      const totalPages = Math.ceil(total / limit);
      return JSON.stringify({
        totalCount: total,
        totalPages: totalPages,
        schedules: schedules,
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'An internal server error occurred',
        error.message,
      );
    }
  }

  //get all schedules by date
  async getSchedulsByDate(date: Date) {
    try {
      return await this.scheduleRepository.find({
        where: {
          date: date,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'An enternal server error occurred',
        error.message,
      );
    }
  }

  //get all schedules of services
  async getAllSchedulesOfServices(
    service_id?: number,
    status?: string,
    page: number = 1,
    limit: number = 10,
  ) {
    try {
      let query = this.scheduleRepository.createQueryBuilder('schedules');
      if (service_id !== undefined && service_id !== null) {
        query = query.where('schedules.service_id = :service_id', {
          service_id,
        });
      }
      if (status) {
        query = query.andWhere('schedules.status = :status', { status });
      }
      const [schedules, total] = await query
        .skip((page - 1) * limit)
        .take(limit)
        .getManyAndCount();
      const totalPages = Math.ceil(total / limit);
      return JSON.stringify({
        totalCount: total,
        totalPages: totalPages,
        schedules: schedules,
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'An internal server error occurred',
        error.message,
      );
    }
  }

  //get all schedules with use details and service details
  async getAllScheduls() {
    const schedules = await this.scheduleRepository
      .createQueryBuilder('schedules')
      .leftJoinAndSelect('schedules.service', 'services')
      .leftJoinAndSelect('schedules.user', 'users')
      // .select([
      //   'schedules.id',
      //   'schedules.start_time',
      //   'schedules.end_time',
      //   'schedules.type',
      //   'schedules.status',
      //   'schedules.date',
      //   'schedules.meeting_url',
      //   'services.name',
      //   'users.first_name',
      //   'users.last_name',
      //   'users.email',
      //   'users.phone',
      // ])
      .getMany();
    return schedules;
  }

  //find schedule by id
  async findScheduleById(id: number): Promise<Schedule | undefined | null> {
    const schedule = await this.scheduleRepository.findOne({
      where: { id },
    });
    return schedule;
  }

  //create a meeting with calender event
  async createcalenderEventWithMeeting(eventDetails) {
    const authClient = await this.optionService.authenticate();
    const auth_credentials = await this.optionService.findOptionByOptionKey(
      Optionkeys?.AUTH_CREDENTIALS,
    );
    const calendar = google.calendar({ version: 'v3', auth: authClient });
    try {
      const response: any = await calendar.events.insert({
        calendarId: auth_credentials?.option_value?.calender_id,
        requestBody: {
          summary: eventDetails?.summary,
          description: eventDetails?.description,
          start: { dateTime: eventDetails?.startTime },
          end: { dateTime: eventDetails?.endTime },
          attendees: [
            { email: eventDetails?.attendeeEmail?.owner_email },
            { email: eventDetails?.attendeeEmail?.user_email },
          ],
          conferenceData: {
            createRequest: {
              requestId: uuidv4(),
              conferenceSolutionKey: {
                type: 'hangoutsMeet',
              },
            },
          },
          reminders: {
            useDefault: false,
            overrides: [
              { method: 'email', minutes: 15 },
              { method: 'popup', minutes: 15 },
            ],
          },
        },
        conferenceDataVersion: 1,
      });
      return response?.data;
    } catch (error) {
      console.error('Error creating meeting:', error);
      throw new Error('Failed to create meeting');
    }
  }

  //reschedules event with meetings
  async rescheduleCalendarEventWithMeeting(eventId: string, eventDetails: any) {
    try {
      const authClient = await this.optionService.authenticate();
      const auth_credentials = await this.optionService.findOptionByOptionKey(
        Optionkeys?.AUTH_CREDENTIALS,
      );
      const calendar = google.calendar({ version: 'v3', auth: authClient });
      const response: any = await calendar.events.update({
        calendarId: auth_credentials?.option_value?.calender_id,
        eventId: eventId,
        requestBody: {
          summary: eventDetails?.summary,
          description: eventDetails?.description,
          start: { dateTime: eventDetails?.startTime },
          end: { dateTime: eventDetails?.endTime },
          attendees: [
            { email: eventDetails?.attendeeEmail?.owner_email },
            { email: eventDetails?.attendeeEmail?.user_email },
          ],
          conferenceData: {
            createRequest: {
              requestId: uuidv4(),
              conferenceSolutionKey: {
                type: 'hangoutsMeet',
              },
            },
          },
          reminders: {
            useDefault: false,
            overrides: [
              { method: 'email', minutes: 15 },
              { method: 'popup', minutes: 15 },
            ],
          },
        },
        conferenceDataVersion: 1,
      });
      return response?.data;
    } catch (error) {
      console.error('Error rescheduling meeting:', error);
      throw new Error('Failed to reschedule meeting');
    }
  }

  //cancel an event delete event
  async cancelCalendarEvent(eventId: string) {
    try {
      const authClient = await this.optionService.authenticate();
      const auth_credentials = await this.optionService.findOptionByOptionKey(
        Optionkeys?.AUTH_CREDENTIALS,
      );
      const calendar = google.calendar({ version: 'v3', auth: authClient });
      await calendar.events.delete({
        calendarId: auth_credentials?.option_value?.calender_id,
        eventId: eventId,
      });
      console.log('Event cancelled successfully');
    } catch (error) {
      console.error('Error cancelling meeting:', error);
      throw new Error('Failed to cancel meeting');
    }
  }
}
