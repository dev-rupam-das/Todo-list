import AppFrame from "../../../components/AppFrame";
import UserManager from "../../../components/UserManager";
import { requireAdminUser } from "../../../lib/auth";
import { getAdminNavItems } from "../../../lib/navigation";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const user = await requireAdminUser();

  return (
    <AppFrame
      user={user}
      title="User Management"
      description="Account creation, password resets, activation state, and role control belong here instead of being buried halfway down a giant dashboard."
      navItems={getAdminNavItems()}
      activeHref="/admin/users"
    >
      <UserManager />
    </AppFrame>
  );
}
