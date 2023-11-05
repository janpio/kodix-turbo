import GeneralSettings from "./general/page";

export default function Settings({ params }: { params: { url: string } }) {
  return <GeneralSettings params={params} />;
}
