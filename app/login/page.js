import LoginForm from "../../components/LoginForm";
import styles from "./page.module.css";

export const metadata = {
  title: "FlowList | Login",
};

export default function LoginPage() {
  return (
    <main className={styles.page}>
      <div className={styles.glow} />
      <section className={styles.card}>
        <div className={styles.copy}>
          <span className={styles.badge}>Authentication required</span>
          <h1>FlowList V2</h1>
          <p>
            This workspace is private now. No public access, no fake signup page,
            and no loose credentials floating around.
          </p>
        </div>

        <LoginForm />
      </section>
    </main>
  );
}
