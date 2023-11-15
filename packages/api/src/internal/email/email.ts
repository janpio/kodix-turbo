import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.resend.com",
  port: 465,
  auth: {
    user: "resend",
    pass: process.env.RESEND_API_KEY, //! TODO: This should probably not be a process.env variable, but mjs import...
  },
});

export default async function sendEmail({
  from,
  to,
  subject,
  html,
}: {
  from: string;
  to: string | string[];
  subject: string;
  html: string;
}) {
  return await transporter.sendMail({
    from,
    to,
    subject: subject,
    html: html,
  });
}
