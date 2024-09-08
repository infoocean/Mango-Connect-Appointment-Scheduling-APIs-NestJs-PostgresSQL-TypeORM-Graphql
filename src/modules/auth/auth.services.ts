import {
  UnauthorizedException,
  HttpStatus,
  Injectable,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserLoginInput } from './authDto/UserLoginInput.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import * as jwt from 'jsonwebtoken';
import { sendEmails } from '../../shared/sendEmails';
import { Repository } from 'typeorm';
import { User } from 'src/graphql/models/user';
import { ResetPasswordInput } from './authDto/resetPasswordInput.dto';
import { VerifyOtpInput } from './authDto/verifyOtpData';
import configuration from 'config/configuration';
import { EmailTemplateService } from '../emailtemplates/emailtemplateservices';
import { RoleService } from '../roles/roles.services';
import { PaymentService } from '../payments/payment.services';
import { ChangePasswordInput } from './authDto/auth_dto';
import { generateOTP } from 'src/shared/generateOtp';
import { replace_email_template } from 'src/shared/replace_email_templates';
import { SuccessResponse } from 'src/shared/successResponce';
import { EmailActionType } from 'src/shared/sendEmail.dto';
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
    private jwtService: JwtService,
    private readonly emailService: EmailTemplateService,
    private readonly roleService: RoleService,
    private readonly paymentService: PaymentService,
  ) {}

  //get authorization token
  async generateAuthorizationToken() {
    const jwtEmail = configuration().jwtEmail;
    const jwtPassword = configuration().jwtPassword;
    const jwtSecret = configuration().jwtSecret;
    const token = jwt.sign({ jwtEmail, jwtPassword }, jwtSecret, {
      expiresIn: configuration().jwtExpiration,
    });
    return {
      message: 'Authorization Token Getting Successfullly!',
      status: 200,
      token: token,
      token_type: 'Bearer',
    };
  }

  //login user
  async login(userLoginData: UserLoginInput) {
    const user = await this.findByEmail(userLoginData.email);
    if (user && user?.is_verified === 0) {
      throw new BadRequestException('Your Account is not verified');
    }
    if (user?.status === 0) {
      throw new BadRequestException(
        'Your Account is not verified or deactivated please forgot your password to activate your account',
      );
    }
    try {
      if (
        !user ||
        !(await bcrypt.compare(userLoginData.password, user.password))
      ) {
        throw new UnauthorizedException('Invalid email or password');
      }
      const userrole = await this.roleService.getRoleById(user.role_id);
      const userPayments = await this.paymentService.getUserPayments(user.id);
      const accessToken = this.jwtService.sign({
        id: user.id,
        email: user.email,
        name: user.first_name + ' ' + user.last_name,
        role_id: user.role_id,
        role: userrole?.role_name,
        customer_id: userPayments?.customer_id,
        phone: user?.phone,
      });
      return {
        message:
          'Login successfully this is your login token you can use this to access apis',
        status: HttpStatus.OK,
        token: accessToken,
        token_type: 'x-access-token',
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid email or password');
    }
  }

  //forgot password
  async forgotPassword(email: string): Promise<string> {
    const user = await this.findByEmail(email);
    if (!user) {
      throw new BadRequestException('Email is not registered');
    }
    try {
      const genOtp = generateOTP(4);
      // Update auth_code in the user table
      user.auth_code = parseInt(genOtp);
      await this.usersRepository.save(user);

      const emailTemplateDetlais =
        await this.emailService.getEmailTemplateByEmailAction(
          EmailActionType?.FORGOT_PASSWORD_EMAIL_ACTION,
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
        emailTo: email,
        emailSub: emailTemplateDetlais[0].subject,
        emailMsg: template,
      };
      sendEmails(sendEmailData);
      return 'Forgot Password Successfully and One time password (OTP) send successfylly in your email. Please check your email to verify your account.';
    } catch (error) {
      throw new BadRequestException(
        'Forgot Password failed. Please try again.',
      );
    }
  }

  //verify user email
  async verifyOtp(verifyOtpData: VerifyOtpInput): Promise<SuccessResponse> {
    try {
      const email = verifyOtpData?.email;
      const user = await this.usersRepository.findOne({
        where: { email, auth_code: verifyOtpData?.otp },
      });
      if (!user) {
        throw new BadRequestException(
          'Verify Otp failed. Please enter valid email or otp.',
        );
      }
      const resetPasswordtoken = jwt.sign(
        {
          email: email,
          id: user.id,
          name: user.first_name + ' ' + user.last_name,
        },
        configuration().jwtSecret,
      );
      const message_res = {
        message: 'OTP Verification successfully',
        status: 200,
        token: resetPasswordtoken,
      };
      user.auth_code = null;
      user.is_verified = 1;
      user.status = 1;
      await this.usersRepository.save(user);
      return message_res;
    } catch (error) {
      throw new BadRequestException(
        'Verify Otp failed. Please enter valid email or otp.',
      );
    }
  }

  //reset password
  async resetpassword(ResetPasswordInput: ResetPasswordInput) {
    try {
      const decodedtoken: any = jwt.verify(
        ResetPasswordInput?.token,
        configuration().jwtSecret,
      );
      const user = await this.findByEmail(decodedtoken?.email);
      if (!user) {
        throw new BadRequestException('token is expired or invalid');
      } else {
        const newpassHash = await bcrypt.hash(ResetPasswordInput?.password, 12);
        user.password = newpassHash;
        await this.usersRepository.save(user);

        const emailTemplateDetlais =
          await this.emailService.getEmailTemplateByEmailAction(
            EmailActionType?.RESET_PASSWORD_EMAIL_ACTION,
          );

        const translationsData = {
          user_name: user?.first_name,
          support_email: configuration().supportEmail,
          app_name: configuration().appName,
        };

        const template = replace_email_template(
          emailTemplateDetlais[0]?.content,
          translationsData,
        );
        const sendEmailData = {
          emailTo: decodedtoken?.email,
          emailSub: emailTemplateDetlais[0].subject,
          emailMsg: template,
        };
        sendEmails(sendEmailData);
        return 'Password reset successfully. You will receive a confirmation email shortly.';
      }
    } catch (error) {
      throw new BadRequestException('Token is expired or invalid');
    }
  }

  //change password
  async changepassword(ChangePasswordInput: ChangePasswordInput) {
    const user = await this.findByEmail(ChangePasswordInput?.email);
    if (
      !(await bcrypt.compare(ChangePasswordInput?.old_password, user.password))
    ) {
      throw new UnauthorizedException('Invalid old password');
    }
    const newpassHash = await bcrypt.hash(ChangePasswordInput?.password, 12);
    user.password = newpassHash;
    await this.usersRepository.save(user);
    //send emails
    const emailTemplateDetlais =
      await this.emailService.getEmailTemplateByEmailAction(
        EmailActionType?.CHANGE_PASSWORD_EMAIL_ACTION,
      );

    const translationsData = {
      user_name: user?.first_name,
      support_email: configuration().supportEmail,
      app_name: configuration().appName,
    };

    const template = replace_email_template(
      emailTemplateDetlais[0]?.content,
      translationsData,
    );
    const sendEmailData = {
      emailTo: ChangePasswordInput?.email,
      emailSub: emailTemplateDetlais[0].subject,
      emailMsg: template,
    };
    sendEmails(sendEmailData);
    return {
      success: true,
      message: 'Password changed successfully',
      status: 200,
    };
  }

  // find user by email
  async findByEmail(email: string): Promise<User | undefined | null> {
    const user = await this.usersRepository.findOne({ where: { email } });
    return user;
  }
}
