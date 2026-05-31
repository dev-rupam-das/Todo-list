import TodoItem from "./TodoItem";
import styles from "./TodoList.module.css";

export default function TodoList({
  todos,
  processingId,
  onDelete,
  onEdit,
  onToggleCompleted,
}) {
  return (
    <div className={styles.list}>
      {todos.map((todo) => (
        <TodoItem
          key={todo._id}
          todo={todo}
          isProcessing={processingId === todo._id}
          onDelete={onDelete}
          onEdit={onEdit}
          onToggleCompleted={onToggleCompleted}
        />
      ))}
    </div>
  );
}
