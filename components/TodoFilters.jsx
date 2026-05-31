import styles from "./TodoFilters.module.css";

const filters = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
];

export default function TodoFilters({
  filter,
  search,
  onFilterChange,
  onSearchChange,
}) {
  return (
    <div className={styles.wrapper}>
      <div>
        <span className={styles.label}>Control center</span>
        <h2>Todo board</h2>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.filterGroup}>
          {filters.map((item) => (
            <button
              key={item.value}
              type="button"
              className={item.value === filter ? styles.activeFilter : styles.filterButton}
              onClick={() => onFilterChange(item.value)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <label className={styles.searchBox}>
          <input
            type="search"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search title or description"
          />
        </label>
      </div>
    </div>
  );
}
