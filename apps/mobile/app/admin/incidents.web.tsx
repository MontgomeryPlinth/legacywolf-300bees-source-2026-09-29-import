import { AdminList } from "../../src/admin/list";
export default function Incidents() {
  return (
    <AdminList
      eyebrow="Incident command"
      title="INCIDENTS"
      empty="No incidents recorded."
      resource="incidents"
    />
  );
}
