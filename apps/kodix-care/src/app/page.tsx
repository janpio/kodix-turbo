import { helpers } from "~/utils/proxy";

async function getData() {
  //
  return await helpers.app.getAll.fetch();
}

export default async function Page() {
  const data = await getData();
  return (
    <div>
      <h1>{JSON.stringify(data)}</h1>
    </div>
  );
}
