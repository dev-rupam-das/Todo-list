import Link from "next/link";
import { getDashboardStats, getRecentTodos } from "../lib/todo-service";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

const formatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

export default async function HomePage() {
  const [stats, recentTodos] = await Promise.all([
    getDashboardStats(),
    getRecentTodos(3),
  ]);

  return (
    <main className={styles.page}>
      <div className={styles.backgroundGlow} />
      <section className={styles.heroCard}>
        <div className={styles.heroCopy}>
          <span className={styles.eyebrow}>2026 personal productivity stack</span>
          <h1>Stay ruthless about what matters and finish the work.</h1>
          <p>
            FlowList gives you a fast, clean command center for planning, tracking,
            and closing tasks without the usual bloated dashboard nonsense.
          </p>
          <div className={styles.heroActions}>
            <Link href="/todos" className={styles.primaryAction}>
              Open Todo Workspace
            </Link>
            <a href="#insights" className={styles.secondaryAction}>
              View Insights
            </a>
          </div>
        </div>

        <div className={styles.heroPanel}>
          <div className={styles.metricCard}>
            <span>Total tasks</span>
            <strong>{stats.total}</strong>
          </div>
          <div className={styles.metricCard}>
            <span>Active tasks</span>
            <strong>{stats.active}</strong>
          </div>
          <div className={styles.metricCard}>
            <span>Completed</span>
            <strong>{stats.completed}</strong>
          </div>
          <div className={styles.metricCard}>
            <span>Completion rate</span>
            <strong>{stats.completionRate}%</strong>
          </div>
        </div>
      </section>

      <section id="insights" className={styles.grid}>
        <article className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <span className={styles.panelTag}>Snapshot</span>
              <h2>Current workload</h2>
            </div>
            <Link href="/todos" className={styles.inlineAction}>
              Manage tasks
            </Link>
          </div>
          <div className={styles.statsGrid}>
            <div className={styles.statBlock}>
              <span>Open items</span>
              <strong>{stats.active}</strong>
              <p>Tasks still demanding attention right now.</p>
            </div>
            <div className={styles.statBlock}>
              <span>Done items</span>
              <strong>{stats.completed}</strong>
              <p>Tasks already shipped and out of the way.</p>
            </div>
          </div>
        </article>

        <article className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <span className={styles.panelTag}>Recent tasks</span>
              <h2>Latest activity</h2>
            </div>
          </div>
          {recentTodos.length === 0 ? (
            <div className={styles.emptyState}>
              <h3>No tasks yet</h3>
              <p>Create your first task in the workspace and this dashboard will stop looking empty.</p>
            </div>
          ) : (
            <div className={styles.recentList}>
              {recentTodos.map((todo) => (
                <div key={todo._id} className={styles.recentItem}>
                  <div>
                    <h3>{todo.title}</h3>
                    <p>{todo.description || "No description added."}</p>
                  </div>
                  <div className={styles.recentMeta}>
                    <span
                      className={
                        todo.completed ? styles.completedBadge : styles.activeBadge
                      }
                    >
                      {todo.completed ? "Completed" : "Active"}
                    </span>
                    <small>{formatter.format(new Date(todo.createdAt))}</small>
                  </div>
                </div>
              ))}
            </div>
          )}
        </article>
      </section>
    </main>
  );
}
