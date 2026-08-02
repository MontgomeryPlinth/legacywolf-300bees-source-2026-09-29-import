import { AdminList } from "../../src/admin/list";
export default function Responders() {
  return (
    <AdminList
      eyebrow="Workforce"
      title="RESPONDERS"
      empty="No responders provisioned."
      resource="responders"
    />
  );
}
