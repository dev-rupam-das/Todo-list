import { requireApiUser, apiErrorResponse } from "../../../lib/api-auth";
import { connectMongoDB } from "../../../lib/mongodb";
import { buildTodoQuery, serializeTodo } from "../../../lib/todos";
import Todo from "../../../models/Todo";

export async function GET(request) {
  try {
    const user = await requireApiUser();
    await connectMongoDB();

    const { searchParams } = new URL(request.url);
    const filter = searchParams.get("filter") || "all";
    const search = searchParams.get("search") || "";
    const scope = searchParams.get("scope") || (user.role === "admin" ? "all" : "personal");

    const todos = await Todo.find(buildTodoQuery(user, { filter, search, scope }))
      .populate("ownerId", "username")
      .sort({ createdAt: -1 })
      .lean();

    return Response.json({
      success: true,
      data: todos.map((todo) => serializeTodo(todo, user)),
    });
  } catch (error) {
    return apiErrorResponse(error, "Failed to fetch todos.");
  }
}

export async function POST(request) {
  try {
    const user = await requireApiUser();
    await connectMongoDB();

    const body = await request.json();
    const title = body?.title?.trim();
    const description = body?.description?.trim() || "";
    const type = body?.type === "global" ? "global" : "personal";

    if (!title) {
      return Response.json(
        { success: false, message: "Title is required." },
        { status: 400 }
      );
    }

    if (user.role !== "admin" && type === "personal") {
      body.ownerId = user.id;
    }

    const todo = await Todo.create({
      title,
      description,
      type,
      ownerId: user.id,
    });

    const populatedTodo = await Todo.findById(todo._id).populate("ownerId", "username").lean();

    return Response.json(
      { success: true, data: serializeTodo(populatedTodo, user) },
      { status: 201 }
    );
  } catch (error) {
    return apiErrorResponse(error, "Failed to create todo.");
  }
}
