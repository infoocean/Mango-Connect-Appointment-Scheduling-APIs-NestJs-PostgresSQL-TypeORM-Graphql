import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthResolver } from './auth.resolver';
import { AuthService } from './auth.services';
import { User } from '../../graphql/models/user';
import { JwtModule } from '@nestjs/jwt';
import configuration from 'config/configuration';
import { Email_Template } from 'src/graphql/models/email_templates';
import { EmailTemplateService } from '../emailtemplates/emailtemplateservices';
import { User_Payment } from 'src/graphql/models/user_payments';
import { Role } from 'src/graphql/models/role';
import { RoleService } from '../roles/roles.services';
import { PaymentService } from '../payments/payment.services';
import { User_Payment_Option } from 'src/graphql/models/user_payment_options';
import { Option } from 'src/graphql/models/options';
import { OptionService } from '../options/option.services';
import { Schedule_Order } from 'src/graphql/models/schedule_orders';
import { Schedule } from 'src/graphql/models/schedule';
@Module({
  imports: [
    JwtModule.register({
      secret: configuration().jwtSecret || process.env.JWT_SECRET,
      signOptions: { expiresIn: configuration().jwtExpiration },
    }),
    TypeOrmModule.forFeature([
      User,
      Email_Template,
      User_Payment,
      User_Payment_Option,
      User,
      Role,
      Option,
      Schedule_Order,
      Schedule,
    ]),
  ],
  providers: [
    AuthResolver,
    AuthService,
    EmailTemplateService,
    RoleService,
    PaymentService,
    OptionService,
  ],
})
export class AuthModule {}
