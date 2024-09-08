import { FooterTemplate } from '../common/footer';
import { HeaderTemplate } from '../common/header';
export const welcomeEmailTemplate = `
        ${HeaderTemplate}
        <!-- Content -->
        <div class="content">
            <p>Hi, {{user_name}}</p>
            <p>You have requested to generate a One-Time Password (OTP) for forgot your password.</p>
            <p>Your OTP is: <b>{{otp}}</b></p>
            <p>Please use this OTP to complete your forgot password. Do not share this OTP with anyone for security reasons.</p>
            <p>If you didn't request this password reset, please ignore this email or contact our support team immediately at <b>{{support_email}}</b>.</p>
            <p>Thank you for your attention to this matter.</p>
            <br>
            <p>Best regards,<br>{{app_name}}</p>
        </div>
        ${FooterTemplate}
  `;

export const forgotPasswordEmailTemplate = `
        ${HeaderTemplate}
        <div class="content">
            <p>Hi, {{user_name}}</p>
            <p>You have requested to generate a One-Time Password (OTP) for forgot your password.</p>
            <p>Your OTP is : <b>{{otp}}</b></p>
            <p>Please use this OTP to complete your forgot password. Do not share this OTP with anyone for security reasons.</p>
            <p>If you didn't request this password reset, please ignore this email or contact our support team immediately at <b>{{support_email}}</b>.</p>
            <p>Thank you for your attention to this matter.</p>
            <br>
            <p>Best regards,<br>{{app_name}}</p>
        </div>
        ${FooterTemplate}
`;

export const resetPasswordEmailTemplate = `
    ${HeaderTemplate}
    <div class="content">
        <p>Hi, {{user_name}}</p>
        <p>You have successfully reset your password.</p>
        <p>Please use new password to login to your account.</p>
        <div style="text-align: center; margin-bottom: 20px;">
        <a href="{{login_url}}" style="background-color: #6584DB; color: #fff; text-decoration: none; padding: 10px 20px; border-radius: 5px;">Login to Your Account</a>
        </div>
        <p>If you didn't request this password reset, please ignore this email or contact our support team immediately at <b>{{support_email}}</b>.</p>
        <p>Thank you for your attention to this matter.</p>
        <br>
        <p>Best regards,<br>{{app_name}}</p>
    </div>
    ${FooterTemplate}
`;

export const scheduleEmailTemplate = `
    ${HeaderTemplate}
    <div class="content">
        <p>Hi, {{user_name}}</p>
        <p>Your appointment has been successfully scheduled.</p>
            <p>Appointment Details:</p>
            <ul>
                <li>Date: <b>{{date}}</b></li>
                <li>Start Time: <b>{{start_time}}</b></li>
                <li>End Time: <b>{{end_time}}</b></li>
            </ul>
        <p>If you didn't request this password reset, please ignore this email or contact our support team immediately at <b>{{support_email}}</b>.</p>
        <p>Thank you for your attention to this matter.</p>
        <br>
        <p>Best regards,<br>{{app_name}}</p>
    </div>
    ${FooterTemplate}
`;

export const scheduleUpdatedEmailTemplate = `
    ${HeaderTemplate}
    <div class="content">
        <p>Hi, {{user_name}}</p>
        <p>Your schedule(appointment) has been updated.</p>
            <p>Appointment Details:</p>
            <ul>
                <li>Date: <b>{{date}}</b></li>
                <li>Start Time: <b>{{start_time}}</b></li>
                <li>End Time: <b>{{end_time}}</b></li>
            </ul>
        <p>If you didn't request this password reset, please ignore this email or contact our support team immediately at <b>{{support_email}}</b>.</p>
        <p>Thank you for your attention to this matter.</p>
        <br>
        <p>Best regards,<br>{{app_name}}</p>
    </div>
    ${FooterTemplate}
`;

export const scheduleCancledEmailTemplate = `
    ${HeaderTemplate}
    <div class="content">
        <p>Hi, {{user_name}}</p>
        <p>Your scheduled(appointment) has been successfully cancled.</p>
            <p>Appointment Details:</p>
            <ul>
                <li>Date: <b>{{date}}</b></li>
                <li>Start Time: <b>{{start_time}}</b></li>
                <li>End Time: <b>{{end_time}}</b></li>
            </ul>
        <p>If you didn't request this password reset, please ignore this email or contact our support team immediately at <b>{{support_email}}</b>.</p>
        <p>Thank you for your attention to this matter.</p>
        <br>
        <p>Best regards,<br>{{app_name}}</p>
    </div>
    ${FooterTemplate}
`;

export const pasymentEmailTemplate = `
    ${HeaderTemplate}
    <div class="content">
        <p>Hi, {{user_name}}</p>
        <p>Your payment has been successfully received.</p>
        <p>Amount: <b>$ {{amount}}</b></p>
        <p>Transaction ID: <b>{{transaction_id}}</b></p>
        <p>If you have any questions regarding this transaction, feel free to contact our support team at <b>{{support_email}}</b>.</p>
        <p>Thank you for choosing our service.</p>
        <br>
        <p>Best regards,<br>{{app_name}}</p>
    </div>
    ${FooterTemplate}
`;
