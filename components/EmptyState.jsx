import Link from "next/link";
import styles from "./EmptyState.module.css";

export default function EmptyState({ title, description }) {
  return (
    <div className={styles.emptyState}>
      <div className={styles.orb} />
      <span className={styles.badge}>Empty state</span>
      <h3>{title}</h3>
      <p>{description}</p>
      <Link href="/" className={styles.link}>
        Back to dashboard
      </Link>
    </div>
  );
}
