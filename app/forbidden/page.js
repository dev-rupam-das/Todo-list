import Link from "next/link";
import styles from "./page.module.css";

export default function ForbiddenPage() {
  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <span className={styles.badge}>403</span>
        <h1>Access denied</h1>
        <p>You do not have permission to use that part of the system.</p>
        <Link href="/" className={styles.link}>
          Return to workspace
        </Link>
      </section>
    </main>
  );
}
