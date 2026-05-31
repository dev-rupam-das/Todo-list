import AppFrame from "../../components/AppFrame";
import { requireAuthenticatedUser } from "../../lib/auth";
import { getAdminNavItems, getUserNavItems } from "../../lib/navigation";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = await requireAuthenticatedUser();

  return (
    <AppFrame
      user={user}
      title="Settings"
      description="Minimal by design. Authentication, account role, and session boundaries matter more than decorative nonsense."
      navItems={user.role === "admin" ? getAdminNavItems() : getUserNavItems()}
      activeHref="/settings"
    >
      <section className={styles.grid}>
        <article className={styles.card}>
          <span className={styles.badge}>Session</span>
          <h3>Current account</h3>
          <p>Username: {user.username}</p>
          <p>Role: {user.role}</p>
          <p>Status: {user.isActive ? "Active" : "Inactive"}</p>
        </article>

        <article className={styles.card}>
          <span className={styles.badge}>Security</span>
          <h3>Protection model</h3>
          <p>JWT session stored in an HTTP-only cookie.</p>
          <p>No public registration path.</p>
          <p>Role checks enforced in middleware, pages, and APIs.</p>
        </article>
      </section>
    </AppFrame>
  );
}
