import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY); //! TODO: This should probably not be a process.env variable, but mjs import...

export default async function sendEmail(
  to: string | string[],
  subject: string,
  react: React.JSX.Element,
) {
  await resend.emails.send({
    from: "Acme <onboarding@resend.dev>",
    to,
    subject: subject,
    react: react,
  });
}
