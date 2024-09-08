import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { User } from '../../graphql/models/user';
import { CreateUserInput } from './usersDto/createUserInput';
import * as bcrypt from 'bcrypt';
import { UpdateUserInput } from './usersDto/updateUserInput';
import { EmailTemplateService } from '../emailtemplates/emailtemplateservices';
import configuration from 'config/configuration';
import { PaymentService } from '../payments/payment.services';
import { generateOTP } from 'src/shared/generateOtp';
import { replace_email_template } from 'src/shared/replace_email_templates';
import { sendEmails } from 'src/shared/sendEmails';
import { EmailActionType } from 'src/shared/sendEmail.dto';
// import { User_Payment } from 'src/graphql/models/user_payments';
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
    private readonly emailService: EmailTemplateService,
    private readonly paymentService: PaymentService,
  ) {}

  //create a new user
  async createUser(createUserData: CreateUserInput) {
    const user = await this.findByEmail(createUserData?.email);
    if (user) {
      throw new ConflictException('Email already registered');
    } else {
      const hashPassword = await bcrypt.hash(createUserData?.password, 12);
      const genOtp = generateOTP(4);
      const newUser = this.usersRepository.create({
        ...createUserData,
        password: hashPassword,
        auth_code: parseInt(genOtp),
      });
      //save user into db
      const user = await this.usersRepository.save(newUser);
      //send email notification
      const emailTemplateDetlais =
        await this.emailService.getEmailTemplateByEmailAction(
          EmailActionType.REGISTRATION_EMAIL_ACTION,
        );
      const translationsData = {
        user_name: user?.first_name,
        otp: parseInt(genOtp),
        support_email: configuration().supportEmail,
        app_name: configuration().appName,
      };
      const template = replace_email_template(
        emailTemplateDetlais[0]?.content,
        translationsData,
      );
      const sendEmailData = {
        emailTo: user?.email,
        emailSub: emailTemplateDetlais[0].subject,
        emailMsg: template,
      };
      sendEmails(sendEmailData);
      //create customer on stripe
      const cust_data = {
        user_id: user.id,
        name: user?.first_name + ' ' + user?.last_name,
        email: user?.email,
        phone: user?.phone,
      };
      const stripe_res =
        await this.paymentService.createStripeCustomer(cust_data);
      let stripe_cust: any;
      if (stripe_res) {
        stripe_cust = JSON.parse(stripe_res);
      }
      //insert customer id into user payments table
      const customer_stripe_info = {
        user_id: user?.id,
        customer_id: stripe_cust?.id,
        payment_profile_id: 'NULL',
      };
      await this.paymentService.createUserPayments(customer_stripe_info);
      return user;
    }
  }

  //update user
  async updateUser(updateUserData: UpdateUserInput) {
    const userId = updateUserData?.id;
    const userToUpdate = await this.usersRepository.findOne({
      where: { id: userId },
    });
    Object.assign(userToUpdate, updateUserData);
    await this.usersRepository.save(userToUpdate);
    return userToUpdate;
  }

  //delete user
  async deleteUser(id: number) {
    const userToDelete = await this.usersRepository.findOne({
      where: { id },
    });
    userToDelete.is_deleted = 1;
    return await this.usersRepository.save(userToDelete);
  }

  //delete single user or multiple user
  async deleteBulkUser(ids: number[]) {
    const usersToDelete = await this.usersRepository.find({
      where: {
        id: In(ids),
      },
    });
    usersToDelete.forEach((user) => {
      user.is_deleted = 1;
    });
    await this.usersRepository.save(usersToDelete);
    return {
      success: true,
      message: 'users deleted successfully',
      status: 200,
      data: 'data deleted',
    };
  }

  //get user by id
  async getUserById(id: number) {
    return this.usersRepository
      .createQueryBuilder('users')
      .leftJoinAndSelect('users.role', 'role')
      .where('users.id = :userId', { userId: id })
      .getOne();
  }

  //get all users
  async getUsers() {
    return this.usersRepository.find({
      where: {
        is_deleted: 0,
      },
      relations: ['role'],
    });
  }

  // find user by email
  async findByEmail(email: string): Promise<User | undefined> {
    const user = await this.usersRepository.findOne({ where: { email } });
    return user;
  }
}
