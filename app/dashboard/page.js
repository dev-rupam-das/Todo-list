import AppFrame from "../../components/AppFrame";
import { requireAuthenticatedUser } from "../../lib/auth";
import { getUserDashboardData } from "../../lib/todo-service";
import { getUserNavItems } from "../../lib/navigation";
import { redirect } from "next/navigation";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await requireAuthenticatedUser();

  if (user.role === "admin") {
    redirect("/admin/dashboard");
  }

  const { stats, recentPersonalTodos, recentGlobalTodos } = await getUserDashboardData(user);

  return (
    <AppFrame
      user={user}
      title="User Dashboard"
      description="Your private tasks stay private. Shared tasks remain visible to every authenticated teammate."
      navItems={getUserNavItems()}
      activeHref="/dashboard"
    >
      <section className={styles.statsGrid}>
        <article className={styles.statCard}>
          <span>My Total Todos</span>
          <strong>{stats.total}</strong>
        </article>
        <article className={styles.statCard}>
          <span>My Completed Todos</span>
          <strong>{stats.completed}</strong>
        </article>
        <article className={styles.statCard}>
          <span>My Pending Todos</span>
          <strong>{stats.pending}</strong>
        </article>
        <article className={styles.statCard}>
          <span>Completion Rate</span>
          <strong>{stats.completionRate}%</strong>
        </article>
      </section>

      <section className={styles.recentGrid}>
        <article className={styles.panel}>
          <span className={styles.badge}>Personal</span>
          <h3>Recent private todos</h3>
          <div className={styles.list}>
            {recentPersonalTodos.length ? (
              recentPersonalTodos.map((todo) => (
                <div key={todo._id} className={styles.listItem}>
                  <strong>{todo.title}</strong>
                  <p>{todo.description || "No description added."}</p>
                </div>
              ))
            ) : (
              <p className={styles.empty}>No personal todos yet.</p>
            )}
          </div>
        </article>

        <article className={styles.panel}>
          <span className={styles.badge}>Global</span>
          <h3>Recent shared todos</h3>
          <div className={styles.list}>
            {recentGlobalTodos.length ? (
              recentGlobalTodos.map((todo) => (
                <div key={todo._id} className={styles.listItem}>
                  <strong>{todo.title}</strong>
                  <p>{todo.ownerUsername ? `Owner ${todo.ownerUsername}` : "Shared task"}</p>
                </div>
              ))
            ) : (
              <p className={styles.empty}>No global todos yet.</p>
            )}
          </div>
        </article>
      </section>

    </AppFrame>
  );
}
