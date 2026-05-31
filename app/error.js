"use client";

import styles from "./error.module.css";

export default function Error({ error, reset }) {
  return (
    <main className={styles.wrapper}>
      <section className={styles.card}>
        <span className={styles.badge}>Runtime error</span>
        <h1>Something broke.</h1>
        <p>{error?.message || "An unexpected error interrupted the page."}</p>
        <button type="button" onClick={reset} className={styles.button}>
          Try again
        </button>
      </section>
    </main>
  );
}
