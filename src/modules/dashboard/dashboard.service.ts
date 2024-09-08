import { Injectable } from '@nestjs/common';
import { Schedule } from 'src/graphql/models/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { User } from 'src/graphql/models/user';
import { Schedule_Order } from 'src/graphql/models/schedule_orders';
import { generatedTodayDatetime } from 'src/shared/generateTodayDateTime';
import { ScheduleStatus } from '../schedules/scheduleDto/scheduleStatus';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Schedule)
    private scheduleRepository: Repository<Schedule>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Schedule_Order)
    private scheduleOrderRepository: Repository<Schedule_Order>,
  ) {}

  async getDashboardData() {
    const totalActiveUsers = await this.userRepository.count({
      where: { status: 1, is_deleted: 0 },
    });
    const totals = await this.scheduleOrderRepository
      .createQueryBuilder('schedule_orders')
      .select('SUM(schedule_orders.amount)', 'totalAmount')
      .addSelect(
        'SUM(COALESCE(schedule_orders.refund_amount, 0))',
        'totalRefundAmount',
      )
      .addSelect(
        'SUM(schedule_orders.amount - COALESCE(schedule_orders.refund_amount, 0))',
        'totalEarnings',
      )
      .getRawOne();
    const totalCanceledSchedules = await this.scheduleRepository.count({
      where: {
        status: ScheduleStatus.CANCELED,
      },
    });
    const todaySchedules = await this.scheduleRepository.count({
      where: {
        date: new Date(new Date().toISOString().split('T')[0]),
      },
    });
    const dashboardData = {
      totalActiveUsers: totalActiveUsers,
      amount: totals,
      totalCanceledSchedules: totalCanceledSchedules,
      todaySchedules: todaySchedules,
    };
    return JSON.stringify(dashboardData);
  }

  async getDashboardDataByUserId(id: number) {
    const totalSchedules = await this.scheduleRepository.count({
      where: { user_id: id },
    });
    const totalOrders = await this.scheduleOrderRepository.count({
      where: { user_id: id },
    });
    const { startOfToday, endOfToday } = generatedTodayDatetime();
    const todaySchedules = await this.scheduleRepository.find({
      where: {
        created_at: Between(startOfToday, endOfToday),
        user_id: id,
      },
    });
    const todayOrders = await this.scheduleOrderRepository.find({
      where: {
        created_at: Between(startOfToday, endOfToday),
        user_id: id,
      },
    });
    const totalCounts = {
      totalSchedules: totalSchedules,
      totalOrders: totalOrders,
      todaySchedules: todaySchedules,
      todayOrders: todayOrders,
    };
    return JSON.stringify(totalCounts);
  }
}
