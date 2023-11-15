import type React from "react";
import { render } from "@react-email/components";
import type { SendMailOptions } from "nodemailer";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "email-smtp.sa-east-1.amazonaws.com",
  port: 587,
  auth: {
    user: process.env.AWS_SMTP_USER,
    pass: process.env.AWS_SMTP_KEY, //! TODO: This should probably not be a process.env variable, but mjs import...
  },
});

export default async function sendEmail(
  mailOptions: Omit<SendMailOptions, "html"> & { react: React.JSX.Element },
) {
  const { react, ...options } = mailOptions;
  const html = render(react);
  return await transporter.sendMail({ ...options, html });
}
