import styles from "./TodoForm.module.css";

export default function TodoForm({
  formData,
  isSubmitting,
  isEditing,
  onFieldChange,
  onSubmit,
  onCancel,
}) {
  return (
    <form onSubmit={onSubmit} className={styles.form}>
      <label className={styles.field}>
        <span>Title</span>
        <input
          type="text"
          name="title"
          placeholder="Ship API docs, close sprint bug, pay rent..."
          value={formData.title}
          onChange={onFieldChange}
          maxLength={120}
          required
        />
      </label>

      <label className={styles.field}>
        <span>Description</span>
        <textarea
          name="description"
          placeholder="Add context so future-you doesn't have to guess what this task means."
          value={formData.description}
          onChange={onFieldChange}
          rows={5}
        />
      </label>

      <div className={styles.actions}>
        <button type="submit" className={styles.primaryButton} disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : isEditing ? "Update task" : "Create task"}
        </button>

        {isEditing ? (
          <button type="button" className={styles.secondaryButton} onClick={onCancel}>
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  );
}
