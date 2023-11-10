import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY); //! TODO: This should probably not be a process.env variable, but mjs import...

export default async function sendEmail({
  to,
  subject,
  react,
}: {
  to: string | string[];
  subject: string;
  react: React.JSX.Element;
}) {
  return await resend.emails.send({
    from: "invitation@kodix.com.br",
    to,
    subject: subject,
    react: react,
  });
}
