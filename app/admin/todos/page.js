import AppFrame from "../../../components/AppFrame";
import TodoShell from "../../../components/TodoShell";
import { requireAdminUser } from "../../../lib/auth";
import { getAdminNavItems } from "../../../lib/navigation";

export const dynamic = "force-dynamic";

export default async function AdminTodosPage() {
  const user = await requireAdminUser();

  return (
    <AppFrame
      user={user}
      title="All Todos"
      description="System-wide task management in one place. Admins can review, edit, and delete across every owner and scope."
      navItems={getAdminNavItems()}
      activeHref="/admin/todos"
    >
      <TodoShell
        currentUser={user}
        defaultScope="all"
        heading="System-wide todo board"
        subtitle="Admin visibility"
        showScopeTabs={false}
      />
    </AppFrame>
  );
}
