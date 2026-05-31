import styles from "./SkeletonList.module.css";

export default function SkeletonList() {
  return (
    <div className={styles.list}>
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className={styles.card}>
          <div className={styles.circle} />
          <div className={styles.copy}>
            <div className={styles.lineShort} />
            <div className={styles.lineLong} />
            <div className={styles.lineMedium} />
          </div>
        </div>
      ))}
    </div>
  );
}
