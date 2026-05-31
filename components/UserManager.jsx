"use client";

import { useEffect, useState } from "react";
import styles from "./UserManager.module.css";

const initialForm = {
  username: "",
  password: "",
  role: "user",
  isActive: true,
};

export default function UserManager() {
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState(initialForm);
  const [editingUserId, setEditingUserId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    setError("");

    const response = await fetch("/api/users", { cache: "no-store" });
    const result = await response.json();

    if (!response.ok || !result.success) {
      setError(result.message || "Unable to load users.");
      return;
    }

    setUsers(result.data);
  }

  function onChange(event) {
    const { name, value, type, checked } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function beginEdit(user) {
    setEditingUserId(user.id);
    setFormData({
      username: user.username,
      password: "",
      role: user.role,
      isActive: user.isActive,
    });
  }

  function resetForm() {
    setEditingUserId("");
    setFormData(initialForm);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setIsSubmitting(true);
      setError("");
      setStatus("");

      const response = await fetch(
        editingUserId ? `/api/users/${editingUserId}` : "/api/users",
        {
          method: editingUserId ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to save user.");
      }

      setStatus(editingUserId ? "User updated." : "User created.");
      resetForm();
      await loadUsers();
    } catch (submissionError) {
      setError(submissionError.message || "Unable to save user.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function deleteUser(user) {
    if (!window.confirm(`Delete ${user.username}? This is permanent.`)) {
      return;
    }

    const response = await fetch(`/api/users/${user.id}`, {
      method: "DELETE",
    });
    const result = await response.json();

    if (!response.ok || !result.success) {
      setError(result.message || "Unable to delete user.");
      return;
    }

    setStatus("User deleted.");
    await loadUsers();
  }

  return (
    <section className={styles.section}>
      <div className={styles.grid}>
        <article className={styles.panel}>
          <div className={styles.header}>
            <div>
              <span className={styles.badge}>Admin controls</span>
              <h3>{editingUserId ? "Edit user" : "Create user"}</h3>
            </div>
          </div>

          <form className={styles.form} onSubmit={handleSubmit}>
            <label className={styles.field}>
              <span>Username</span>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={onChange}
                required
              />
            </label>

            <label className={styles.field}>
              <span>{editingUserId ? "Reset password" : "Password"}</span>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={onChange}
                placeholder={editingUserId ? "Leave blank to keep current password" : ""}
                required={!editingUserId}
              />
            </label>

            <label className={styles.field}>
              <span>Role</span>
              <select name="role" value={formData.role} onChange={onChange}>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </label>

            <label className={styles.checkbox}>
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={onChange}
              />
              <span>Account active</span>
            </label>

            {error ? <p className={styles.error}>{error}</p> : null}
            {status ? <p className={styles.status}>{status}</p> : null}

            <div className={styles.actions}>
              <button
                type="submit"
                className={styles.primaryButton}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : editingUserId ? "Update user" : "Create user"}
              </button>

              {editingUserId ? (
                <button
                  type="button"
                  className={styles.secondaryButton}
                  onClick={resetForm}
                >
                  Cancel
                </button>
              ) : null}
            </div>
          </form>
        </article>

        <article className={styles.panel}>
          <div className={styles.header}>
            <div>
              <span className={styles.badge}>Directory</span>
              <h3>Managed users</h3>
            </div>
          </div>

          <div className={styles.table}>
            {users.map((user) => (
              <div key={user.id} className={styles.row}>
                <div>
                  <strong>{user.username}</strong>
                  <p>
                    {user.role} - {user.isActive ? "Active" : "Inactive"}
                  </p>
                </div>
                <div className={styles.rowActions}>
                  <button
                    type="button"
                    className={styles.inlineButton}
                    onClick={() => beginEdit(user)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className={styles.deleteButton}
                    onClick={() => deleteUser(user)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}
