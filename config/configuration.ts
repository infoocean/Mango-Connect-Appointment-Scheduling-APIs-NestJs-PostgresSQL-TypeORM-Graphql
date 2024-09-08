export default () => ({
  // server Port
  port: process.env.PORT,

  // Postgres Configuration
  postgresHost: process.env.POSTGRES_HOST,
  postgresUser: process.env.POSTGRES_USER,
  postgresPassword: process.env.POSTGRES_PASSWORD,
  postgresDatabase: process.env.POSTGRES_DATABASE,
  postgresPort: process.env.POSTGRES_PORT,

  // JWT Configuration
  jwtSecret:
    process.env.JWT_SECRET ||
    '$2b$12$cfURajWiJ39h/6v0K6Kwn.x79O.Ou6rKL/Pm4mko4asyDIHk.JUzC',
  jwtExpiration: process.env.JWT_EXPIRATION || '8h',
  jwtEmail: process.env.JWT_EMAIL,
  jwtPassword: process.env.JWT_PASSWORD,

  // NodeMailer Configuration
  nodeMailerUser: process.env.NODEMAILER_USER,
  nodeMailerPassword: process.env.NODEMAILER_PASSWORD,
  nodeMailerHost: process.env.NODEMAILER_HOST,
  nodeMailerPort: process.env.NODEMAILER_PORT,
  fromEmail: process.env.FROMEMAIL,
  supportEmail: process.env.SUPPORTEMAIL,

  // App Configuration
  appName: process.env.APP_NAME,
  appUrl: process.env.APP_URL,

  //stripe keys
  stripe_pk: process.env.STRIPE_PK,
  stripe_sk: process.env.STRIPE_SK,

  //google auth credentials
  google_calender_scope: process.env.google_calender_scope,
});
