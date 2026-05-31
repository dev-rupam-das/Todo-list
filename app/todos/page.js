import Link from "next/link";
import TodoShell from "../../components/TodoShell";
import ThemeToggle from "../../components/ThemeToggle";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export default function TodosPage() {
  return (
    <main className={styles.page}>
      <div className={styles.backgroundAura} />
      <section className={styles.shell}>
        <header className={styles.header}>
          <div>
            <Link href="/" className={styles.backLink}>
              Dashboard
            </Link>
            <h1>Todo Workspace</h1>
            <p>Build focus, kill clutter, and keep the execution loop tight.</p>
          </div>
          <ThemeToggle />
        </header>

        <TodoShell />
      </section>
    </main>
  );
}
