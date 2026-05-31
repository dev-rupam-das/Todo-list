import { connectMongoDB, hasMongoURI } from "./mongodb";
import Todo from "../models/Todo";
import User from "../models/User";
import { serializeTodo } from "./todos";

function emptyUserStats() {
  return {
    total: 0,
    completed: 0,
    pending: 0,
    personal: 0,
    global: 0,
    completionRate: 0,
  };
}

function emptyAdminStats() {
  return {
    totalUsers: 0,
    activeUsers: 0,
    totalTodos: 0,
    personalTodos: 0,
    globalTodos: 0,
    completionRate: 0,
  };
}

export async function getUserDashboardData(user) {
  if (!hasMongoURI()) {
    return {
      stats: emptyUserStats(),
      recentPersonalTodos: [],
      recentGlobalTodos: [],
    };
  }

  try {
    await connectMongoDB();

    const [personalTodos, globalTodos] = await Promise.all([
      Todo.find({ ownerId: user.id, type: "personal" })
        .populate("ownerId", "username")
        .sort({ createdAt: -1 })
        .lean(),
      Todo.find({ type: "global" })
        .populate("ownerId", "username")
        .sort({ createdAt: -1 })
        .lean(),
    ]);

    const allOwnedTodos = await Todo.find({ ownerId: user.id }).lean();
    const completed = allOwnedTodos.filter((todo) => todo.completed).length;
    const total = allOwnedTodos.length;

    return {
      stats: {
        total,
        completed,
        pending: total - completed,
        personal: personalTodos.length,
        global: globalTodos.filter((todo) => todo.ownerId._id.toString() === user.id).length,
        completionRate: total ? Math.round((completed / total) * 100) : 0,
      },
      recentPersonalTodos: personalTodos.slice(0, 5).map((todo) => serializeTodo(todo, user)),
      recentGlobalTodos: globalTodos.slice(0, 5).map((todo) => serializeTodo(todo, user)),
    };
  } catch (error) {
    console.error("User dashboard fallback:", error.message);

    return {
      stats: emptyUserStats(),
      recentPersonalTodos: [],
      recentGlobalTodos: [],
    };
  }
}

export async function getAdminDashboardData(user) {
  if (!hasMongoURI()) {
    return {
      stats: emptyAdminStats(),
      recentTodos: [],
      recentUsers: [],
    };
  }

  try {
    await connectMongoDB();

    const [users, todos] = await Promise.all([
      User.find({}).sort({ createdAt: -1 }).lean(),
      Todo.find({}).populate("ownerId", "username").sort({ createdAt: -1 }).lean(),
    ]);

    const completed = todos.filter((todo) => todo.completed).length;
    const personalTodos = todos.filter((todo) => todo.type === "personal").length;
    const globalTodos = todos.filter((todo) => todo.type === "global").length;

    return {
      stats: {
        totalUsers: users.length,
        activeUsers: users.filter((item) => item.isActive).length,
        totalTodos: todos.length,
        personalTodos,
        globalTodos,
        completionRate: todos.length ? Math.round((completed / todos.length) * 100) : 0,
      },
      recentTodos: todos.slice(0, 6).map((todo) => serializeTodo(todo, user)),
      recentUsers: users.slice(0, 6).map((item) => ({
        id: item._id.toString(),
        username: item.username,
        role: item.role,
        isActive: item.isActive,
        createdAt: item.createdAt,
      })),
    };
  } catch (error) {
    console.error("Admin dashboard fallback:", error.message);

    return {
      stats: emptyAdminStats(),
      recentTodos: [],
      recentUsers: [],
    };
  }
}
