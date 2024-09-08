import {
  Resolver,
  Query,
  Args,
  Mutation,
  Context,
  Int,
  Float,
} from '@nestjs/graphql';
import {
  createCustomerCardInfo,
  createCustomerDataInput,
  createpaymentIntent,
  // createpaymentIntent,
  CreateUserPaymentInput,
  CreateUserPaymentOptionInput,
} from './paymentDto/createPaymentInput';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/middleware/auth.guard';
import { AuthorizationGuard } from 'src/middleware/auth.middleware';
import { PaymentService } from './payment.services';
import { User_Payment } from 'src/graphql/models/user_payments';
import { User_Payment_Option } from 'src/graphql/models/user_payment_options';
import { commonResponse } from 'src/shared/common_responce';

@Resolver()
export class PaymentResolver {
  constructor(private paymentService: PaymentService) {}

  //create customer on stripe
  @Mutation(() => String)
  @UseGuards(AuthorizationGuard)
  async createCustomeronStripe(
    @Args('createCustomerData') createCustomerData: createCustomerDataInput,
  ) {
    return this.paymentService.createStripeCustomer(createCustomerData);
  }

  //save, update delete customer card
  @Mutation(() => commonResponse)
  async saveCustomerCard(
    @Args('customerCardInfo') customerCardInfo: createCustomerCardInfo,
  ) {
    return this.paymentService.saveCustomerCard(customerCardInfo);
  }

  //get customer cards
  @Query(() => commonResponse)
  async getCustomerCards(
    @Args('customer_id', { type: () => String }) customer_id: string,
    @Args('user_id', { type: () => Number }) user_id: number,
  ) {
    return this.paymentService.getCustomerCards(customer_id, user_id);
  }

  //create payment intent
  @Mutation(() => String)
  @UseGuards(AuthorizationGuard, AuthGuard)
  async createPaymentIntent(
    @Context() context: any,
    @Args('paymentInfo') paymentInfo: createpaymentIntent,
  ) {
    const current_user = context.req.user;
    return this.paymentService.createPaymentIntent(paymentInfo, current_user);
  }

  //create a refund payment from stripe
  @Mutation(() => commonResponse)
  @UseGuards(AuthorizationGuard, AuthGuard)
  async refundPayment(
    @Context() context: any,
    @Args('schedule_id', { type: () => Int }) schedule_id: number,
    @Args('amount', { type: () => Float }) amount: number,
  ) {
    return this.paymentService.refundPayment(schedule_id, amount);
  }

  //get user payment details by user id
  @Query(() => User_Payment)
  @UseGuards(AuthorizationGuard, AuthGuard)
  async getUserPayment(
    @Args('user_id', { type: () => Number }) user_id: number,
  ) {
    return this.paymentService.getUserPayments(user_id);
  }

  //update(Create) user payment table after payment has been successfully
  @Mutation(() => User_Payment)
  @UseGuards(AuthorizationGuard, AuthGuard)
  async createUserPayment(
    @Args('createPaymentData') createPaymentData: CreateUserPaymentInput,
  ) {
    return this.paymentService.createUserPayments(createPaymentData);
  }

  //create user payment options
  @Mutation(() => User_Payment_Option)
  @UseGuards(AuthorizationGuard, AuthGuard)
  async createUserPaymentOptions(
    @Args('createPaymentOptionData')
    createPaymentOptionData: CreateUserPaymentOptionInput,
  ) {
    return this.paymentService.createUserPaymentOptions(
      createPaymentOptionData,
    );
  }
}
