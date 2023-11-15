import type React from "react";
import { render } from "@react-email/components";
import type { SendMailOptions } from "nodemailer";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.resend.com",
  port: 465,
  auth: {
    user: "resend",
    pass: process.env.RESEND_API_KEY, //! TODO: This should probably not be a process.env variable, but mjs import...
  },
});

export default async function sendEmail(
  mailOptions: Omit<SendMailOptions, "html"> & { react: React.JSX.Element },
) {
  const { react, ...options } = mailOptions;
  const html = render(react);
  return await transporter.sendMail({ ...options, html });
}
