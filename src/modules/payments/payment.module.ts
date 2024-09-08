import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PaymentService } from './payment.services';
import { PaymentResolver } from './payment.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User_Payment } from 'src/graphql/models/user_payments';
import { OptionModule } from '../options/option.module';
import { User_Payment_Option } from 'src/graphql/models/user_payment_options';
import { Schedule_Order } from 'src/graphql/models/schedule_orders';
import { Schedule } from 'src/graphql/models/schedule';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      User_Payment,
      User_Payment_Option,
      Schedule_Order,
      Schedule,
    ]),
    OptionModule,
  ],
  providers: [PaymentResolver, PaymentService, JwtService],
  exports: [PaymentService],
})
export class PaymentModule {}
