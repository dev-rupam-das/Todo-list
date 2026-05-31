import Link from "next/link";
import ThemeToggle from "./ThemeToggle";
import LogoutButton from "./LogoutButton";
import styles from "./AppFrame.module.css";

export default function AppFrame({
  user,
  title,
  description,
  navItems,
  activeHref,
  children,
}) {
  return (
    <main className={styles.page}>
      <div className={styles.backgroundGlow} />

      <div className={styles.shell}>
        <aside className={styles.sidebar}>
          <div className={styles.brandBlock}>
            <span className={styles.badge}>{user.role === "admin" ? "Admin mode" : "Workspace"}</span>
            <h1>FlowList</h1>
            <p>Structured execution without public access, fake permissions, or loose ends.</p>
          </div>

          <nav className={styles.nav}>
            {navItems.map((item, index) => (
              <Link
                key={item.id || `${item.href}-${item.label}-${index}`}
                href={item.href}
                className={
                  item.href === activeHref ? `${styles.navLink} ${styles.activeNavLink}` : styles.navLink
                }
                aria-current={item.href === activeHref ? "page" : undefined}
              >
                <span>{item.label}</span>
                <small>{item.caption}</small>
              </Link>
            ))}
          </nav>

          <div className={styles.sidebarFooter}>
            <div className={styles.userCard}>
              <strong>{user.username}</strong>
              <span>{user.role}</span>
            </div>
            <LogoutButton className={styles.logoutButton} />
          </div>
        </aside>

        <section className={styles.content}>
          <header className={styles.header}>
            <div>
              <span className={styles.badge}>Protected workspace</span>
              <h2>{title}</h2>
              <p>{description}</p>
            </div>
            <ThemeToggle />
          </header>

          {children}
        </section>
      </div>
    </main>
  );
}
