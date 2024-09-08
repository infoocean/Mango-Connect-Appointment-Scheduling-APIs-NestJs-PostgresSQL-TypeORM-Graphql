import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  createCustomerCardInfo,
  createCustomerDataInput,
  createpaymentIntent,
  // createpaymentIntent,
  CreateUserPaymentInput,
  CreateUserPaymentOptionInput,
} from './paymentDto/createPaymentInput';
import Stripe from 'stripe';
import { InjectRepository } from '@nestjs/typeorm';
import { User_Payment } from 'src/graphql/models/user_payments';
import { Repository } from 'typeorm';
import { OptionService } from '../options/option.services';
import { User_Payment_Option } from 'src/graphql/models/user_payment_options';
import { CurrentUserData } from 'src/shared/current_user_dto';
import { Schedule_Order } from 'src/graphql/models/schedule_orders';
import { UserPaymentOptionName } from './paymentDto/userPaymentOptionName';
import { OrderStatus } from '../orders/orderDto/orderStatus';
import { Schedule } from 'src/graphql/models/schedule';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(User_Payment)
    private userPaymentRepository: Repository<User_Payment>,
    @InjectRepository(User_Payment_Option)
    private paymentoptionService: Repository<User_Payment_Option>,
    @InjectRepository(Schedule_Order)
    private scheduleOrder_repository: Repository<Schedule_Order>,
    @InjectRepository(Schedule)
    private scheduleRepository: Repository<Schedule>,
    private readonly optionService: OptionService,
  ) {}

  //get stripe keys from db
  async getStrile_sk() {
    const stripekey =
      await this.optionService.findOptionByOptionKey('org_stripe_keys');
    let stripe_sk: string;
    if (stripekey?.option_value?.live_mode_status === true) {
      stripe_sk = stripekey?.option_value?.live_mode?.stripe_sk;
    } else {
      stripe_sk = stripekey?.option_value?.test_mode?.stripe_sk;
    }
    return stripe_sk;
  }

  //create a new customer on stripe
  async createStripeCustomer(createCustomerData: createCustomerDataInput) {
    const stripe = new Stripe(await this.getStrile_sk());
    const existCustomeronStripe = await this.getUserPayments(
      createCustomerData?.user_id,
    );
    if (existCustomeronStripe) {
      throw new BadRequestException('User allready created on stripe');
    }
    try {
      const customer = await stripe.customers.create({
        name: createCustomerData?.name,
        email: createCustomerData?.email,
        phone: createCustomerData?.phone,
      });
      return JSON.stringify(customer);
    } catch (error) {
      throw new Error(error);
    }
  }

  // save customer cards, update and also delete
  async saveCustomerCard(customerCardInfo: createCustomerCardInfo) {
    const cards: any = customerCardInfo;
    const customer: any = await this.getUserPayments(customerCardInfo?.user_id);
    if (customer) {
      const data = {
        user_payment_id: customer?.id,
        option_name: customerCardInfo?.key,
        option_value: customerCardInfo?.value,
      };
      try {
        const paymentOption = await this.paymentoptionService.findOne({
          where: {
            user_payment_id: customer?.id,
            option_name: UserPaymentOptionName?.CARD_HISTORY,
          },
        });
        if (paymentOption === null) {
          await this.paymentoptionService.save(data);
          return {
            success: true,
            message: 'User card added successfully',
            status: 201,
          };
        } else {
          if (cards?.value?.card.length > 1 && paymentOption.option_value) {
            paymentOption.option_value = cards?.value;
            await this.paymentoptionService.save(paymentOption);
          } else {
            paymentOption.option_value = cards?.value;
            await this.paymentoptionService.save(paymentOption);
          }
          return {
            success: true,
            message: 'User card added successfully',
            status: 201,
          };
        }
      } catch (error) {
        console.error('Error saving card:', error);
        throw error;
      }
    } else {
      return {
        success: true,
        message: 'user not found',
        status: 201,
      };
    }
  }

  // get custoner cards details
  async getCustomerCards(
    customer_id: string,
    user_id: number,
  ): Promise<any | undefined> {
    const customer: any = await this.getUserPayments(user_id);
    try {
      const cards = await this.paymentoptionService.findOne({
        where: {
          user_payment_id: customer?.id,
          option_name: UserPaymentOptionName?.CARD_HISTORY,
        },
      });
      return {
        success: true,
        message: 'User card getting successfully',
        status: 201,
        data: JSON.stringify(cards?.option_value),
      };
    } catch (error) {
      console.error('Error fetching cards:', error);
      throw new BadRequestException(error);
    }
  }

  //create a payment intent
  async createPaymentIntent(
    paymentInfo: createpaymentIntent,
    current_user: CurrentUserData,
  ) {
    const stripe = new Stripe(await this.getStrile_sk());
    try {
      // Create Payment Intent
      const customerId = paymentInfo?.customer_id;
      const cardId = paymentInfo?.cardId;
      const amount = paymentInfo?.amount * 100; // Amount in cents
      const currency = 'usd';
      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency,
        customer: customerId,
        payment_method: cardId,
        confirm: true,
        return_url: 'https://example.com/checkout/success',
      });
      // If payment is successful, return the payment intent
      const userPayment = await this.findByuserId(current_user?.id);
      const data = {
        user_payment_id: userPayment?.id.toString(),
        option_name: UserPaymentOptionName?.PAYMENT_HISTORY,
        option_value: [paymentIntent],
      };
      await this.createUserPaymentOptions(data);
      return JSON.stringify(paymentIntent);
    } catch (error) {
      // Handle errors
      console.error('Error making payment:', error);
      throw error;
    }
  }

  //refund payment
  async refundPayment(schedule_id: number, amount: number) {
    const getSchedule = await this.scheduleRepository.findOne({
      where: { id: schedule_id },
    });
    const scheduleId =
      getSchedule?.parent_id === 0 ? schedule_id : getSchedule?.parent_id;
    try {
      const schedule_order = await this.scheduleOrder_repository.findOne({
        where: { schedule_id: scheduleId },
      });
      const stripe = new Stripe(await this.getStrile_sk());
      // Create a refund
      const refund = await stripe.refunds.create({
        payment_intent: schedule_order?.transaction_id,
        amount: amount * 100,
      });
      //update order
      schedule_order.status = OrderStatus?.REFUND;
      schedule_order.refund_id = refund?.id;
      schedule_order.refund_amount = amount;
      await this.scheduleOrder_repository.save(schedule_order);
      //save refund history
      const cust_Payment_info = await this.getUserPayments(
        schedule_order?.user_id,
      );
      const data = {
        user_payment_id: cust_Payment_info?.id.toString(),
        option_name: UserPaymentOptionName?.PAYMENT_REFUND_HISTORY,
        option_value: [refund],
      };
      await this.createUserPaymentOptions(data);
      return {
        status: 200,
        message: 'Refund amount was successfully refunded',
        success: true,
        data: JSON.stringify(refund),
      };
    } catch (error) {
      throw new Error(error);
    }
  }

  //inset payment details user payment table
  async createUserPayments(createPaymentData: CreateUserPaymentInput) {
    try {
      return this.userPaymentRepository.save(createPaymentData);
    } catch (error) {
      throw new InternalServerErrorException(
        'An Internal server error occurred',
        error.message,
      );
    }
  }

  //get user payment info like custome id
  async getUserPayments(user_id: number) {
    try {
      return await this.findByuserId(user_id);
    } catch (error) {
      throw new InternalServerErrorException(
        'An Internal server error occurred',
        error.message,
      );
    }
  }

  //create user payment options
  async createUserPaymentOptions(
    createPaymentOptionData: CreateUserPaymentOptionInput,
  ) {
    try {
      return this.paymentoptionService.save(createPaymentOptionData);
    } catch (error) {
      throw new InternalServerErrorException(
        'An Internal server error occurred',
        error.message,
      );
    }
  }

  // find user payment details by user id
  async findByuserId(
    user_id: number,
  ): Promise<CreateUserPaymentInput | undefined> {
    const userPayment = await this.userPaymentRepository.findOne({
      where: { user_id },
    });
    return userPayment;
  }
}
