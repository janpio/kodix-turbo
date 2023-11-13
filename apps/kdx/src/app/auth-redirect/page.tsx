import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default function AuthRedirect() {
  const sessionToken = cookies().get("next-auth")?.toString();

  redirect(
    `http://localhost:3001${sessionToken ? `?token=${sessionToken}` : ""}`,
  );
}
