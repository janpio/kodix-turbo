import type React from "react";
import * as aws from "@aws-sdk/client-ses";
import { render } from "@react-email/components";
import type { SendMailOptions } from "nodemailer";
import nodemailer from "nodemailer";

if (!process.env.AWS_SMTP_USER || !process.env.AWS_SMTP_PASSWORD)
  throw new Error("Missing AWS credentials");

const ses = new aws.SES({
  apiVersion: "2010-12-01",
  region: "sa-east-1", // Your region will need to be updated
  credentials: {
    accessKeyId: process.env.AWS_SMTP_USER,
    secretAccessKey: process.env.AWS_SMTP_PASSWORD,
  },
  serviceId: "ses",
});

const transporter = nodemailer.createTransport({
  SES: { ses, aws },
});

// const transporter = nodemailer.createTransport({
//   host: "smtp.resend.com",
//   port: 465,
//   auth: {
//     user: "resend",
//     pass: process.env.RESEND_API_KEY, //! TODO: This should probably not be a process.env variable, but mjs import...
//   },
// });

export default async function sendEmail(
  mailOptions: Omit<SendMailOptions, "html"> & { react: React.JSX.Element },
) {
  const { react, ...options } = mailOptions;
  const html = render(react);
  return await transporter.sendMail({ ...options, html });
}
