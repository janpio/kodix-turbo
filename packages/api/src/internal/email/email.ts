import type React from "react";
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
  if (mailOptions.to === "banana@gmail.com")
    throw new Error("You can't send emails to");

  return await transporter.sendMail(mailOptions);
}
