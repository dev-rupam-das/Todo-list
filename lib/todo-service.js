import { connectMongoDB, hasMongoURI } from "./mongodb";
import Todo from "../models/Todo";

export async function getDashboardStats() {
  if (!hasMongoURI()) {
    return {
      total: 0,
      active: 0,
      completed: 0,
      completionRate: 0,
    };
  }

  try {
    await connectMongoDB();

    const todos = await Todo.find({}, "completed").lean();
    const total = todos.length;
    const completed = todos.filter((todo) => todo.completed).length;
    const active = total - completed;

    return {
      total,
      active,
      completed,
      completionRate: total ? Math.round((completed / total) * 100) : 0,
    };
  } catch (error) {
    console.error("Dashboard stats fallback:", error.message);

    return {
      total: 0,
      active: 0,
      completed: 0,
      completionRate: 0,
    };
  }
}

export async function getRecentTodos(limit = 3) {
  if (!hasMongoURI()) {
    return [];
  }

  try {
    await connectMongoDB();

    return Todo.find({})
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  } catch (error) {
    console.error("Recent todos fallback:", error.message);
    return [];
  }
}
