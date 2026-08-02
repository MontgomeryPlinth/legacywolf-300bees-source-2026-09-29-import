import { AdminList } from "../../src/admin/list";
export default function Users() {
  return (
    <AdminList
      eyebrow="Accounts"
      title="USERS"
      empty="No user accounts available."
      resource="users"
    />
  );
}
