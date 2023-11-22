import { Resend } from "resend";
import type { CreateEmailOptions } from "resend/build/src/emails/interfaces";

// import nodemailer from "nodemailer";
const resend = new Resend(process.env.RESEND_API_KEY);

// if (!process.env.AWS_SMTP_USER || !process.env.AWS_SMTP_PASSWORD)
//   throw new Error("Missing AWS credentials");

// const ses = new aws.SES({
//   apiVersion: "2010-12-01",
//   region: "sa-east-1", // Your region will need to be updated
//   credentials: {
//     accessKeyId: process.env.AWS_SMTP_USER,
//     secretAccessKey: process.env.AWS_SMTP_PASSWORD,
//   },
//   serviceId: "ses",
// });

// const transporter = nodemailer.createTransport({
//   SES: { ses, aws },
// });

// const transporter = nodemailer.createTransport({
//   host: "smtp.resend.com",
//   port: 465,
//   auth: {
//     user: "resend",
//     pass: process.env.RESEND_API_KEY, //! TODO: This should probably not be a process.env variable, but mjs import...
//   },
// });

export default async function sendEmail(mailOptions: CreateEmailOptions) {
  // const result = await transporter.sendMail({ ...options, html });
  try {
    await resend.emails.send(mailOptions);
  } catch (error) {
    console.log({ error });
  }
}
