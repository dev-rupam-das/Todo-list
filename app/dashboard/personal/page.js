import AppFrame from "../../../components/AppFrame";
import TodoShell from "../../../components/TodoShell";
import { requireAuthenticatedUser } from "../../../lib/auth";
import { getUserNavItems } from "../../../lib/navigation";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function PersonalTodosPage() {
  const user = await requireAuthenticatedUser();

  if (user.role === "admin") {
    redirect("/admin/dashboard");
  }

  return (
    <AppFrame
      user={user}
      title="Personal Todos"
      description="Your private task lane. Only you and admins should be able to see this work."
      navItems={getUserNavItems()}
      activeHref="/dashboard/personal"
    >
      <TodoShell
        currentUser={user}
        defaultScope="personal"
        heading="Personal task board"
        subtitle="Private workspace"
        showScopeTabs={false}
        lockedType="personal"
      />
    </AppFrame>
  );
}
