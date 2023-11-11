import type { SendVerificationRequestParams } from "next-auth/providers";
import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);

export const sendVerificationRequest = async (
  params: SendVerificationRequestParams,
) => {
  try {
    await resend.emails.send({
      from: "login@kodix.com.br",
      to: params.identifier,
      subject: "Kodix login verification",
      html: `<a href="${params.url}">Here's your magic link. Click to sign in.</a>`,
    });
  } catch (error) {
    console.log({ error });
  }
};
