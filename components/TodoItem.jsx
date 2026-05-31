import styles from "./TodoItem.module.css";

const formatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

export default function TodoItem({
  todo,
  isProcessing,
  onDelete,
  onEdit,
  onToggleCompleted,
}) {
  return (
    <article className={todo.completed ? styles.completedCard : styles.card}>
      <div className={styles.content}>
        <button
          type="button"
          className={todo.completed ? styles.checkedToggle : styles.toggle}
          onClick={() => onToggleCompleted(todo)}
          disabled={isProcessing}
          aria-label={todo.completed ? "Mark as active" : "Mark as completed"}
        >
          <span />
        </button>

        <div className={styles.copy}>
          <div className={styles.topRow}>
            <h3>{todo.title}</h3>
            <span className={todo.completed ? styles.completedBadge : styles.activeBadge}>
              {todo.completed ? "Completed" : "Active"}
            </span>
          </div>

          <p>{todo.description || "No description added."}</p>

          <div className={styles.metaRow}>
            <small>Created {formatter.format(new Date(todo.createdAt))}</small>
          </div>
        </div>
      </div>

      <div className={styles.actions}>
        <button type="button" className={styles.editButton} onClick={() => onEdit(todo)}>
          Edit
        </button>
        <button
          type="button"
          className={styles.deleteButton}
          onClick={() => onDelete(todo)}
          disabled={isProcessing}
        >
          {isProcessing ? "Working..." : "Delete"}
        </button>
      </div>
    </article>
  );
}
