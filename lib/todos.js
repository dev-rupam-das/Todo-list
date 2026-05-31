export function buildTodoQuery(user, { filter = "all", search = "", scope = "personal" } = {}) {
  const query = {};

  if (user.role !== "admin") {
    if (scope === "global") {
      query.type = "global";
    } else {
      query.type = "personal";
      query.ownerId = user.id;
    }
  } else if (scope !== "all") {
    query.type = scope === "global" ? "global" : "personal";
  }

  if (filter === "active") {
    query.completed = false;
  }

  if (filter === "completed") {
    query.completed = true;
  }

  const trimmedSearch = search.trim();

  if (trimmedSearch) {
    query.$or = [
      { title: { $regex: trimmedSearch, $options: "i" } },
      { description: { $regex: trimmedSearch, $options: "i" } },
    ];
  }

  return query;
}

export function canManageTodo(user, todo) {
  if (user.role === "admin") {
    return true;
  }

  if (!todo.ownerId) {
    return false;
  }

  const ownerId =
    typeof todo.ownerId === "object" && todo.ownerId._id
      ? todo.ownerId._id.toString()
      : todo.ownerId.toString();
  const isOwner = ownerId === user.id;

  if (todo.type === "personal") {
    return isOwner;
  }

  return isOwner;
}

export function canViewTodo(user, todo) {
  if (user.role === "admin") {
    return true;
  }

  if (todo.type === "global") {
    return true;
  }

  if (!todo.ownerId) {
    return false;
  }

  const ownerId =
    typeof todo.ownerId === "object" && todo.ownerId._id
      ? todo.ownerId._id.toString()
      : todo.ownerId.toString();

  return ownerId === user.id;
}

export function serializeTodo(todo, user) {
  const ownerId = todo.ownerId
    ? todo.ownerId._id
      ? todo.ownerId._id.toString()
      : todo.ownerId.toString()
    : null;
  const ownerUsername = todo.ownerId?.username || null;
  const canEdit = user.role === "admin" || ownerId === user.id;
  const canDelete = canEdit;

  return {
    _id: todo._id.toString(),
    title: todo.title,
    description: todo.description,
    completed: todo.completed,
    type: todo.type || "personal",
    ownerId,
    ownerUsername: ownerUsername || "legacy-record",
    createdAt: todo.createdAt,
    updatedAt: todo.updatedAt,
    permissions: {
      canEdit,
      canDelete,
    },
  };
}
