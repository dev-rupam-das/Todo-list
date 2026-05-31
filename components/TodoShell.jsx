"use client";

import { useDeferredValue, useEffect, useState } from "react";
import ConfirmDialog from "./ConfirmDialog";
import EmptyState from "./EmptyState";
import SkeletonList from "./SkeletonList";
import TodoFilters from "./TodoFilters";
import TodoForm from "./TodoForm";
import TodoList from "./TodoList";
import ToastStack from "./ToastStack";
import styles from "./TodoShell.module.css";

const initialFormState = {
  title: "",
  description: "",
};

export default function TodoShell() {
  const [todos, setTodos] = useState([]);
  const [formData, setFormData] = useState(initialFormState);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [isFetching, setIsFetching] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingTodo, setEditingTodo] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [processingId, setProcessingId] = useState("");
  const [toasts, setToasts] = useState([]);
  const deferredSearch = useDeferredValue(search);

  const total = todos.length;
  const completed = todos.filter((todo) => todo.completed).length;
  const active = total - completed;
  const stats = {
    total,
    active,
    completed,
    completionRate: total ? Math.round((completed / total) * 100) : 0,
  };

  useEffect(() => {
    fetchTodos();
  }, [filter, deferredSearch]);

  function showToast(type, message) {
    const id = crypto.randomUUID();

    setToasts((current) => [...current, { id, type, message }]);

    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 3200);
  }

  async function fetchTodos() {
    try {
      setIsFetching(true);

      const params = new URLSearchParams({
        filter,
        search: deferredSearch,
      });

      const response = await fetch(`/api/todos?${params.toString()}`, {
        cache: "no-store",
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to fetch todos.");
      }

      setTodos(result.data);
    } catch (error) {
      showToast("error", error.message || "Unable to load todos.");
    } finally {
      setIsFetching(false);
    }
  }

  function onFieldChange(event) {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setIsSubmitting(true);

      const method = editingTodo ? "PATCH" : "POST";
      const endpoint = editingTodo ? `/api/todos/${editingTodo._id}` : "/api/todos";

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to save todo.");
      }

      setFormData(initialFormState);
      setEditingTodo(null);
      showToast("success", editingTodo ? "Todo updated." : "Todo created.");
      await fetchTodos();
    } catch (error) {
      showToast("error", error.message || "Unable to save todo.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function beginEdit(todo) {
    setEditingTodo(todo);
    setFormData({
      title: todo.title,
      description: todo.description || "",
    });
  }

  function cancelEdit() {
    setEditingTodo(null);
    setFormData(initialFormState);
  }

  async function toggleCompleted(todo) {
    try {
      setProcessingId(todo._id);

      const response = await fetch(`/api/todos/${todo._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          completed: !todo.completed,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to update todo.");
      }

      showToast(
        "success",
        result.data.completed ? "Todo marked complete." : "Todo moved back to active."
      );
      await fetchTodos();
    } catch (error) {
      showToast("error", error.message || "Unable to update todo.");
    } finally {
      setProcessingId("");
    }
  }

  async function deleteTodo() {
    if (!pendingDelete) {
      return;
    }

    try {
      setProcessingId(pendingDelete._id);

      const response = await fetch(`/api/todos/${pendingDelete._id}`, {
        method: "DELETE",
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to delete todo.");
      }

      showToast("success", "Todo deleted.");
      setPendingDelete(null);
      await fetchTodos();
    } catch (error) {
      showToast("error", error.message || "Unable to delete todo.");
    } finally {
      setProcessingId("");
    }
  }

  return (
    <>
      <ToastStack toasts={toasts} />

      <section className={styles.layout}>
        <div className={styles.leftColumn}>
          <article className={styles.editorCard}>
            <div className={styles.cardHeader}>
              <div>
                <span className={styles.label}>Write mode</span>
                <h2>{editingTodo ? "Edit task" : "Create a new task"}</h2>
              </div>
            </div>

            <TodoForm
              formData={formData}
              isSubmitting={isSubmitting}
              isEditing={Boolean(editingTodo)}
              onFieldChange={onFieldChange}
              onSubmit={handleSubmit}
              onCancel={cancelEdit}
            />
          </article>

          <article className={styles.summaryCard}>
            <div className={styles.cardHeader}>
              <div>
                <span className={styles.label}>Performance</span>
                <h2>Task velocity</h2>
              </div>
            </div>

            <div className={styles.statsGrid}>
              <div className={styles.statBox}>
                <span>Total</span>
                <strong>{stats.total}</strong>
              </div>
              <div className={styles.statBox}>
                <span>Active</span>
                <strong>{stats.active}</strong>
              </div>
              <div className={styles.statBox}>
                <span>Completed</span>
                <strong>{stats.completed}</strong>
              </div>
              <div className={styles.progressBox}>
                <span>Completion</span>
                <strong>{stats.completionRate}%</strong>
                <div className={styles.progressTrack}>
                  <div
                    className={styles.progressFill}
                    style={{ width: `${stats.completionRate}%` }}
                  />
                </div>
              </div>
            </div>
          </article>
        </div>

        <div className={styles.rightColumn}>
          <article className={styles.boardCard}>
            <TodoFilters
              filter={filter}
              search={search}
              onFilterChange={setFilter}
              onSearchChange={setSearch}
            />

            {isFetching ? (
              <SkeletonList />
            ) : todos.length === 0 ? (
              <EmptyState
                title="No matching tasks"
                description="Either you have nothing to do, or your filter is excluding everything. Fix one of those."
              />
            ) : (
              <TodoList
                todos={todos}
                processingId={processingId}
                onDelete={setPendingDelete}
                onEdit={beginEdit}
                onToggleCompleted={toggleCompleted}
              />
            )}
          </article>
        </div>
      </section>

      <ConfirmDialog
        isOpen={Boolean(pendingDelete)}
        isLoading={processingId === pendingDelete?._id}
        title="Delete task?"
        description={`You're about to permanently remove "${pendingDelete?.title || ""}". This action cannot be undone.`}
        confirmLabel="Delete task"
        onCancel={() => setPendingDelete(null)}
        onConfirm={deleteTodo}
      />
    </>
  );
}
