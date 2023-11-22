import * as React from "react";
import {
  Body,
  Button,
  Column,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Text,
} from "@react-email/components";

export function Email() {
  return (
    <Html lang="en">
      <Head />
      <Preview>previewww</Preview>
      <Body className="mx-auto my-auto bg-white font-sans">
        <Container className="mx-auto my-[40px] w-[465px] rounded border border-solid border-[#eaeaea] p-[20px]">
          <Section className="mt-[32px]">
            <Img
              src={`/static/vercel-logo.png`}
              width="40"
              height="37"
              alt="Vercel"
              className="mx-auto my-0"
            />
          </Section>
          <Heading className="mx-0 my-[30px] p-0 text-center text-[24px] font-normal text-black">
            Join <strong>team name</strong> on <strong>Vercel</strong>
          </Heading>
          <Text className="text-[14px] leading-[24px] text-black">
            Hello username,
          </Text>
          <Text className="text-[14px] leading-[24px] text-black">
            <strong>bukinoshita</strong> (
            <Link
              href={`mailto:${"gdbianchii@gmail.com "}`}
              className="text-blue-600 no-underline"
            >
              invitidedByEmail
            </Link>
            ) has invited you to the <strong>teamName</strong> team on{" "}
            <strong>Vercel</strong>.
          </Text>
          <Section>
            <Row>
              <Column align="right">
                <Img
                  className="rounded-full"
                  src={"userImage"}
                  width="64"
                  height="64"
                />
              </Column>
              <Column align="center">
                <Img
                  src={`/static/vercel-arrow.png`}
                  width="12"
                  height="9"
                  alt="invited you to"
                />
              </Column>
              <Column align="left">
                <Img
                  className="rounded-full"
                  src={"teamImage"}
                  width="64"
                  height="64"
                />
              </Column>
            </Row>
          </Section>
          <Section className="mb-[32px] mt-[32px] text-center">
            <Button
              className="h-16 w-24 rounded bg-[#000000] text-center text-[12px] font-semibold text-white no-underline"
              href={"inviteLink"}
            >
              Join the team
            </Button>
          </Section>
          <Text className="text-[14px] leading-[24px] text-black">
            or copy and paste this URL into your browser:{" "}
            <Link href={"inviteLink"} className="text-blue-600 no-underline">
              {"inviteLink"}
            </Link>
          </Text>
          <Hr className="mx-0 my-[26px] w-full border border-solid border-[#eaeaea]" />
          <Text className="text-[12px] leading-[24px] text-[#666666]">
            This invitation was intended for{" "}
            <span className="text-black">username </span>.This invite was sent
            from <span className="text-black">{"inviteFromIp"}</span> located in{" "}
            <span className="text-black">invite from location</span>. If you
            were not expecting this invitation, you can ignore this email. If
            you are concerned about your account&apos;s safety, please reply to
            this email to get in touch with us.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
