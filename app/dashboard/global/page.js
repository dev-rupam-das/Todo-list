import AppFrame from "../../../components/AppFrame";
import TodoShell from "../../../components/TodoShell";
import { requireAuthenticatedUser } from "../../../lib/auth";
import { getUserNavItems } from "../../../lib/navigation";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function GlobalTodosPage() {
  const user = await requireAuthenticatedUser();

  if (user.role === "admin") {
    redirect("/admin/dashboard");
  }

  return (
    <AppFrame
      user={user}
      title="Global Todos"
      description="Shared work visible to every authenticated user. Users can only edit what they own."
      navItems={getUserNavItems()}
      activeHref="/dashboard/global"
    >
      <TodoShell
        currentUser={user}
        defaultScope="global"
        heading="Global task board"
        subtitle="Shared workspace"
        showScopeTabs={false}
        lockedType="global"
      />
    </AppFrame>
  );
}
