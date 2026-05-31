import styles from "./loading.module.css";

export default function Loading() {
  return (
    <main className={styles.wrapper}>
      <div className={styles.card}>
        <div className={styles.shimmerTitle} />
        <div className={styles.shimmerBody} />
        <div className={styles.grid}>
          <div className={styles.tile} />
          <div className={styles.tile} />
          <div className={styles.tile} />
        </div>
      </div>
    </main>
  );
}
