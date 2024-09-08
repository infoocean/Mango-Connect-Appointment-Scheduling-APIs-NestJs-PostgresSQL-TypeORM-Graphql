import { Resolver, Args, Mutation, Context, Int, Query } from '@nestjs/graphql';
import {
  CreateOrderInput,
  UpdateOrderInput,
} from './orderDto/createOrderInput';
import { AuthGuard } from 'src/middleware/auth.guard';
import { AuthorizationGuard } from 'src/middleware/auth.middleware';
import { Schedule_Order } from 'src/graphql/models/schedule_orders';
import { OrderService } from './order.services';
import { UseGuards } from '@nestjs/common';
import { commonResponse } from 'src/shared/common_responce';

@Resolver(() => Schedule_Order)
export class OrderResolver {
  constructor(private orderService: OrderService) {}

  //create Order
  @Mutation(() => Schedule_Order)
  @UseGuards(AuthorizationGuard, AuthGuard)
  async createOrder(
    @Context() context: any,
    @Args('createOrderData') createOrderData: CreateOrderInput,
  ) {
    const current_user = context.req.user;
    return this.orderService.createOrder(createOrderData, current_user);
  }

  //update  Order
  @Mutation(() => Schedule_Order)
  @UseGuards(AuthorizationGuard, AuthGuard)
  async updateOrder(
    @Args('updateOrderData') updateOrderData: UpdateOrderInput,
    @Context() context: any,
  ) {
    const current_user = context.req.user;
    return this.orderService.updateOrder(updateOrderData, current_user);
  }

  //get all orders
  @Query(() => [Schedule_Order])
  @UseGuards(AuthorizationGuard, AuthGuard)
  async getOrders() {
    return this.orderService.getOrders();
  }

  //get orders by user id
  @Query(() => [Schedule_Order])
  @UseGuards(AuthorizationGuard, AuthGuard)
  async getOrdersByUserId(
    @Args('user_id', { type: () => Int }) id: number,
    @Context() context: any,
  ) {
    const current_user = context.req.user;
    return this.orderService.getOrdersByUserId(current_user, id);
  }

  //get orders details by orders id
  @Query(() => [Schedule_Order])
  @UseGuards(AuthorizationGuard, AuthGuard)
  async getOrderDetailsById(@Args('order_id', { type: () => Int }) id: number) {
    return this.orderService.getOrderDetailsById(id);
  }

  //delete ordets single delete or bulk delete
  @Query(() => commonResponse)
  @UseGuards(AuthorizationGuard, AuthGuard)
  async deleteOrder(@Args('ids', { type: () => [Int] }) ids: number[]) {
    return this.orderService.deleteOrder(ids);
  }
}
