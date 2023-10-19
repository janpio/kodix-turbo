import Link from "next/link";
import { api } from "@/trpc/server";

export default async function Page() {
  const apps = await api.app.getAll.query();
  return (
    <div>
      <Link href="/loggedOrNot">Logged or not?</Link>
      <h1>{JSON.stringify(apps)}</h1>
    </div>
  );
}
