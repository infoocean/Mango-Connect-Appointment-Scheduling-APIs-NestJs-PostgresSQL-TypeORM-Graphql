import configuration from 'config/configuration';
import { SendEmailDto } from './sendEmail.dto';
export const sendEmails = async (sendemaildto: SendEmailDto) => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const nodemailer = require('nodemailer');
  try {
    const mailOptions = {
      from: configuration().fromEmail,
      to: sendemaildto.emailTo,
      subject: sendemaildto.emailSub,
      html: sendemaildto.emailMsg,
    };
    const transporter = nodemailer.createTransport({
      host: configuration().nodeMailerHost,
      port: configuration().nodeMailerPort,
      auth: {
        user: configuration().nodeMailerUser,
        pass: configuration().nodeMailerPassword,
      },
    });
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ' + info.response);
  } catch (error) {
    console.error('smtp error ----', error);
  }
};
