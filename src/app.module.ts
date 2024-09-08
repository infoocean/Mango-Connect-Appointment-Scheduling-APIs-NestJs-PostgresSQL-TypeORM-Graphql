import { ApolloDriverConfig, ApolloDriver } from '@nestjs/apollo';
import { Module, OnModuleInit } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './graphql/models/user';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { RoleModule } from './modules/roles/roles.module';
import { Role } from './graphql/models/role';
import { Availability } from './graphql/models/availability';
import { AvailabilityModule } from './modules/availability/availability.module';
import { Option } from './graphql/models/options';
import { Schedule } from './graphql/models/schedule';
import { Schedule_Order } from './graphql/models/schedule_orders';
import { User_Payment } from './graphql/models/user_payments';
import { User_Payment_Option } from './graphql/models/user_payment_options';
import { Email_Template } from './graphql/models/email_templates';
import { OptionModule } from './modules/options/option.module';
import { OrderModule } from './modules/orders/order.module';
import { PaymentModule } from './modules/payments/payment.module';
import { EmailTemplateModule } from './modules/emailtemplates/emailtemplate.module';
import { ScheduleModule } from './modules/schedules/schedule.module';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from 'config/configuration';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { MigrationDataService } from 'src/migration.data.service';
import { join } from 'path';
import { Services } from './graphql/models/services';
import { ServiceModule } from './modules/services/services.module';
import { ServeStaticModule } from '@nestjs/serve-static';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
    TypeOrmModule.forFeature([Role, User, Option, Email_Template]),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      subscriptions: {
        'graphql-ws': true,
      },
      autoSchemaFile: 'src/schema.gql',
      plugins: [ApolloServerPluginLandingPageLocalDefault()],
      playground: false,
    }),
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
      load: [configuration],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('postgresHost'),
        port: configService.get<number>('postgresPort'),
        username: configService.get<string>('postgresUser'),
        password: configService.get<string>('postgresPassword'),
        database: configService.get<string>('postgresDatabase'),
        entities: [
          User,
          Role,
          Availability,
          Option,
          Schedule,
          Schedule_Order,
          User_Payment,
          User_Payment_Option,
          Email_Template,
          Services,
        ],
        synchronize: true,
        logging: false,
        // timezone: 'UTC',
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    RoleModule,
    UsersModule,
    AvailabilityModule,
    OptionModule,
    OrderModule,
    PaymentModule,
    EmailTemplateModule,
    ScheduleModule,
    DashboardModule,
    ServiceModule,
  ],
  providers: [MigrationDataService],
  exports: [],
})
export class AppModule implements OnModuleInit {
  MigrationDataService: any;
  constructor(private readonly myDataService: MigrationDataService) {}

  async onModuleInit() {
    // Insert initial data when the module is initialized
    //await this.myDataService.insertInitialRole();
    //await this.myDataService.insertInitialSiteOption();
    //await this.myDataService.insertInitialEmailTemplates();
    ///await this.myDataService.insertInitialUser();
  }
}
