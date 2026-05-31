import styles from "./ToastStack.module.css";

export default function ToastStack({ toasts }) {
  return (
    <div className={styles.stack}>
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={toast.type === "success" ? styles.successToast : styles.errorToast}
        >
          <strong>{toast.type === "success" ? "Success" : "Error"}</strong>
          <p>{toast.message}</p>
        </div>
      ))}
    </div>
  );
}
