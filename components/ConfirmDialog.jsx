import styles from "./ConfirmDialog.module.css";

export default function ConfirmDialog({
  isOpen,
  isLoading,
  title,
  description,
  confirmLabel,
  onCancel,
  onConfirm,
}) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className={styles.backdrop}>
      <div className={styles.dialog}>
        <span className={styles.badge}>Destructive action</span>
        <h2>{title}</h2>
        <p>{description}</p>
        <div className={styles.actions}>
          <button type="button" className={styles.secondaryButton} onClick={onCancel}>
            Cancel
          </button>
          <button
            type="button"
            className={styles.primaryButton}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? "Deleting..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
