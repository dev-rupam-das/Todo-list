import AppFrame from "../../../components/AppFrame";
import { requireAdminUser } from "../../../lib/auth";
import { getAdminDashboardData } from "../../../lib/todo-service";
import { getAdminNavItems } from "../../../lib/navigation";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const user = await requireAdminUser();
  const { stats, recentTodos, recentUsers } = await getAdminDashboardData(user);

  return (
    <AppFrame
      user={user}
      title="Admin Dashboard"
      description="Full system visibility, role-aware control, and zero public exposure."
      navItems={getAdminNavItems()}
      activeHref="/admin/dashboard"
    >
      <section className={styles.statsGrid}>
        <article className={styles.statCard}>
          <span>Total Users</span>
          <strong>{stats.totalUsers}</strong>
        </article>
        <article className={styles.statCard}>
          <span>Active Users</span>
          <strong>{stats.activeUsers}</strong>
        </article>
        <article className={styles.statCard}>
          <span>Total Todos</span>
          <strong>{stats.totalTodos}</strong>
        </article>
        <article className={styles.statCard}>
          <span>Personal Todos</span>
          <strong>{stats.personalTodos}</strong>
        </article>
        <article className={styles.statCard}>
          <span>Global Todos</span>
          <strong>{stats.globalTodos}</strong>
        </article>
        <article className={styles.statCard}>
          <span>Completion Rate</span>
          <strong>{stats.completionRate}%</strong>
        </article>
      </section>

      <section className={styles.recentGrid}>
        <article className={styles.panel}>
          <span className={styles.badge}>Recent users</span>
          <h3>Newest accounts</h3>
          <div className={styles.list}>
            {recentUsers.length ? (
              recentUsers.map((account) => (
                <div key={account.id} className={styles.listItem}>
                  <strong>{account.username}</strong>
                  <p>
                    {account.role} - {account.isActive ? "Active" : "Inactive"}
                  </p>
                </div>
              ))
            ) : (
              <p className={styles.empty}>No users found.</p>
            )}
          </div>
        </article>

        <article className={styles.panel}>
          <span className={styles.badge}>Recent todos</span>
          <h3>Latest task activity</h3>
          <div className={styles.list}>
            {recentTodos.length ? (
              recentTodos.map((todo) => (
                <div key={todo._id} className={styles.listItem}>
                  <strong>{todo.title}</strong>
                  <p>
                    {todo.type} - {todo.ownerUsername || "Unknown owner"}
                  </p>
                </div>
              ))
            ) : (
              <p className={styles.empty}>No todos found.</p>
            )}
          </div>
        </article>
      </section>
    </AppFrame>
  );
}
