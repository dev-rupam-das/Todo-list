"use client";

import { useDeferredValue, useEffect, useRef, useState } from "react";
import ConfirmDialog from "./ConfirmDialog";
import EmptyState from "./EmptyState";
import SkeletonList from "./SkeletonList";
import TodoFilters from "./TodoFilters";
import TodoForm from "./TodoForm";
import TodoList from "./TodoList";
import ToastStack from "./ToastStack";
import styles from "./TodoShell.module.css";

const LIVE_SYNC_INTERVAL_MS = 5000;

const timeFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
  second: "2-digit",
});

function getScopeOptions(isAdmin) {
  if (isAdmin) {
    return [
      { value: "all", label: "All todos" },
      { value: "personal", label: "Personal" },
      { value: "global", label: "Global" },
    ];
  }

  return [
    { value: "personal", label: "Personal Todos" },
    { value: "global", label: "Global Todos" },
  ];
}

export default function TodoShell({
  currentUser,
  defaultScope = "personal",
  heading = "Todo board",
  subtitle = "Control center",
  showScopeTabs = true,
  lockedType = "",
}) {
  const isAdmin = currentUser.role === "admin";
  const scopeOptions = getScopeOptions(isAdmin);
  const typeOptions = lockedType
    ? []
    : [
        { value: "personal", label: "Personal" },
        { value: "global", label: "Global" },
      ];

  const [todos, setTodos] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: lockedType || (defaultScope === "all" ? "global" : defaultScope),
  });
  const [scope, setScope] = useState(defaultScope);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [isFetching, setIsFetching] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingTodo, setEditingTodo] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [processingId, setProcessingId] = useState("");
  const [toasts, setToasts] = useState([]);
  const [lastSyncedAt, setLastSyncedAt] = useState(null);
  const deferredSearch = useDeferredValue(search);

  const syncInFlightRef = useRef(false);
  const pollTimerRef = useRef(null);

  const total = todos.length;
  const completed = todos.filter((todo) => todo.completed).length;
  const active = total - completed;
  const stats = {
    total,
    active,
    completed,
    completionRate: total ? Math.round((completed / total) * 100) : 0,
  };

  function showToast(type, message) {
    const id = crypto.randomUUID();

    setToasts((current) => [...current, { id, type, message }]);

    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 3200);
  }

  async function fetchTodos({
    showLoader = true,
    notifyOnError = true,
  } = {}) {
    if (syncInFlightRef.current) {
      return;
    }

    try {
      syncInFlightRef.current = true;

      if (showLoader) {
        setIsFetching(true);
      }

      const params = new URLSearchParams({
        filter,
        search: deferredSearch,
        scope,
      });

      const response = await fetch(`/api/todos?${params.toString()}`, {
        cache: "no-store",
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to fetch todos.");
      }

      setTodos(result.data);
      setLastSyncedAt(new Date());
    } catch (error) {
      if (notifyOnError) {
        showToast("error", error.message || "Unable to load todos.");
      }
    } finally {
      syncInFlightRef.current = false;

      if (showLoader) {
        setIsFetching(false);
      }
    }
  }

  useEffect(() => {
    fetchTodos({
      showLoader: true,
      notifyOnError: true,
    });

    return () => {
      syncInFlightRef.current = false;
    };
  }, [scope, filter, deferredSearch]);

  useEffect(() => {
    function clearPolling() {
      if (pollTimerRef.current) {
        window.clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }
    }

    function pollSilently() {
      if (document.visibilityState !== "visible") {
        return;
      }

      fetchTodos({
        showLoader: false,
        notifyOnError: false,
      });
    }

    clearPolling();
    pollTimerRef.current = window.setInterval(pollSilently, LIVE_SYNC_INTERVAL_MS);

    window.addEventListener("focus", pollSilently);
    document.addEventListener("visibilitychange", pollSilently);

    return () => {
      clearPolling();
      window.removeEventListener("focus", pollSilently);
      document.removeEventListener("visibilitychange", pollSilently);
    };
  }, [scope, filter, deferredSearch]);

  useEffect(() => {
    if (!editingTodo) {
      const nextType =
        lockedType ||
        (scope === "all"
          ? currentUser.role === "admin"
            ? "global"
            : "personal"
          : scope);

      setFormData((current) => {
        if (current.type === nextType) {
          return current;
        }

        return { ...current, type: nextType };
      });
    }
  }, [scope, editingTodo, lockedType, currentUser.role]);

  function resetForm(nextType) {
    setFormData({
      title: "",
      description: "",
      type: nextType || lockedType || (scope === "all" ? "global" : scope),
    });
  }

  function onFieldChange(event) {
    const { name, value } = event.target;

    if (lockedType && name === "type") {
      return;
    }

    setFormData((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setIsSubmitting(true);

      const method = editingTodo ? "PUT" : "POST";
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

      resetForm();
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
    if (!todo.permissions?.canEdit) {
      showToast("error", "You cannot edit this todo.");
      return;
    }

    setEditingTodo(todo);
    setFormData({
      title: todo.title,
      description: todo.description || "",
      type: lockedType || todo.type,
    });
  }

  function cancelEdit() {
    setEditingTodo(null);
    resetForm();
  }

  async function toggleCompleted(todo) {
    if (!todo.permissions?.canEdit) {
      showToast("error", "You cannot update this todo.");
      return;
    }

    try {
      setProcessingId(todo._id);

      const response = await fetch(`/api/todos/${todo._id}`, {
        method: "PUT",
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
                <p className={styles.helperText}>
                  {isAdmin
                    ? "Admins can create and manage both personal and global work."
                    : "Users can manage personal work privately and global work collaboratively."}
                </p>
              </div>
            </div>

            <TodoForm
              formData={formData}
              isSubmitting={isSubmitting}
              isEditing={Boolean(editingTodo)}
              typeOptions={typeOptions}
              onFieldChange={onFieldChange}
              onSubmit={handleSubmit}
              onCancel={cancelEdit}
            />
          </article>

          <article className={styles.summaryCard}>
            <div className={styles.cardHeader}>
              <div>
                <span className={styles.label}>Performance</span>
                <h2>Visible workload</h2>
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
            {showScopeTabs ? (
              <div className={styles.scopeTabs}>
                {scopeOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={scope === option.value ? styles.activeScopeTab : styles.scopeTab}
                    onClick={() => setScope(option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            ) : null}

            <TodoFilters
              filter={filter}
              search={search}
              onFilterChange={setFilter}
              onSearchChange={setSearch}
            />

            <div className={styles.boardHeading}>
              <div className={styles.boardHeadingTop}>
                <span className={styles.label}>{subtitle}</span>
                <span className={styles.syncMeta}>
                  Live sync every 5s
                  {lastSyncedAt
                    ? ` - Last sync ${timeFormatter.format(lastSyncedAt)}`
                    : ""}
                </span>
              </div>
              <h2>{heading}</h2>
            </div>

            {isFetching ? (
              <SkeletonList />
            ) : todos.length === 0 ? (
              <EmptyState
                title="No matching tasks"
                description="Either nothing exists in this scope yet, or your filters are too narrow."
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
