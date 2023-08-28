import { Dialog } from "./Dialog";

export async function GithubUser({ username }: { username: string }) {
  const user = await fetch(`https://api.github.com/users/${username}`);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const data = await user.json();

  await new Promise((resolve) => setTimeout(resolve, 3000));

  return (
    <div>
      <Dialog />
      <p>{JSON.stringify(data)}</p>
    </div>
  );
}
