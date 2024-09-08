import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import {
  CreateOrderInput,
  UpdateOrderInput,
} from './orderDto/createOrderInput';
import { Schedule_Order } from 'src/graphql/models/schedule_orders';
import { EmailTemplateService } from '../emailtemplates/emailtemplateservices';
import configuration from 'config/configuration';
import { UserService } from '../users/users.services';
import { ScheduleService } from '../schedules/schedule.services';
import { CurrentUserData } from 'src/shared/current_user_dto';
import { replace_email_template } from 'src/shared/replace_email_templates';
import { sendEmails } from 'src/shared/sendEmails';
import { EmailActionType } from 'src/shared/sendEmail.dto';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Schedule_Order)
    private scheduleOrderRepository: Repository<Schedule_Order>,
    private readonly emailService: EmailTemplateService,
    private readonly userService: UserService,
    private readonly scheduleService: ScheduleService,
  ) {}

  //creare schedul order
  async createOrder(
    scheduleOrderData: CreateOrderInput,
    current_user: CurrentUserData,
  ) {
    try {
      const emailTemplateDetlais =
        await this.emailService.getEmailTemplateByEmailAction(
          EmailActionType?.PAYMENT_SUCCESS_EMAIL_ACTION,
        );
      const translationsData = {
        user_name: current_user?.name,
        amount: scheduleOrderData.amount,
        transaction_id: scheduleOrderData.transaction_id,
        support_email: configuration().supportEmail,
        app_name: configuration().appName,
      };

      const template = replace_email_template(
        emailTemplateDetlais[0]?.content,
        translationsData,
      );
      const sendEmailData = {
        emailTo: current_user?.email,
        emailSub: emailTemplateDetlais[0].subject,
        emailMsg: template,
      };
      sendEmails(sendEmailData);
      return this.scheduleOrderRepository.save(scheduleOrderData);
    } catch (error) {
      throw new InternalServerErrorException(
        'An internal server error occurred',
        error.message,
      );
    }
  }

  //update the schedule order
  async updateOrder(
    scheduleOrderData: UpdateOrderInput,
    current_user: CurrentUserData,
  ) {
    try {
      const scheduleOrderToUpdate = await this.findById(
        scheduleOrderData?.order_id,
      );

      Object.assign(scheduleOrderToUpdate, scheduleOrderData);
      await this.scheduleOrderRepository.save(scheduleOrderToUpdate);

      const emailTemplateDetlais =
        await this.emailService.getEmailTemplateByEmailAction(
          'payment_success_email_template',
        );

      const translationsData = {
        user_name: current_user?.name,
        amount: scheduleOrderToUpdate?.amount,
        transaction_id: scheduleOrderToUpdate?.transaction_id,
        support_email: configuration().supportEmail,
        app_name: configuration().appName,
      };

      const template = replace_email_template(
        emailTemplateDetlais[0]?.content,
        translationsData,
      );
      const sendEmailData = {
        emailTo: current_user?.email,
        emailSub: emailTemplateDetlais[0].subject,
        emailMsg: template,
      };
      sendEmails(sendEmailData);
      return scheduleOrderToUpdate;
    } catch (error) {
      throw new InternalServerErrorException(
        'An internal server error occurred',
        error.message,
      );
    }
  }

  //get all orders
  async getOrders() {
    const orders = await this.scheduleOrderRepository
      .createQueryBuilder('schedule_orders')
      .leftJoinAndSelect('schedule_orders.user', 'users')
      .leftJoinAndSelect('schedule_orders.schedule', 'schedules')
      .leftJoinAndSelect('schedules.service', 'services')
      .getMany();
    return orders;
  }

  //get orders by user id
  async getOrdersByUserId(current_user: CurrentUserData, id: number) {
    const orders = await this.scheduleOrderRepository
      .createQueryBuilder('schedule_orders')
      .leftJoinAndSelect('schedule_orders.schedule', 'schedules')
      .leftJoinAndSelect('schedules.service', 'services')
      .where('schedule_orders.user_id = :userId', { userId: id })
      .getMany();
    return orders;
  }

  //get orders details by id
  async getOrderDetailsById(order_id: number) {
    const orders = await this.scheduleOrderRepository
      .createQueryBuilder('schedule_orders')
      .leftJoinAndSelect('schedule_orders.user', 'users')
      .leftJoinAndSelect('schedule_orders.schedule', 'schedules')
      .leftJoinAndSelect('schedules.service', 'services')
      .where('schedule_orders.id = :orderId', { orderId: order_id })
      .getMany();
    return orders;
  }

  //delete oredr
  async deleteOrder(ids: number[]) {
    const orderToDelete = await this.scheduleOrderRepository.find({
      where: {
        id: In(ids),
      },
    });
    await this.scheduleOrderRepository.remove(orderToDelete);
    return {
      success: true,
      message: 'order deleted successfully',
      status: 200,
      data: 'data deleted',
    };
  }

  // find order by order id
  async findById(id: number): Promise<Schedule_Order | undefined | null> {
    const order = await this.scheduleOrderRepository.findOne({ where: { id } });
    return order;
  }

  //find order by schedule id
  async findOrderbyScheduleId(schedule_id: number) {
    return await this.scheduleOrderRepository.findOne({
      where: { schedule_id },
    });
  }
}
