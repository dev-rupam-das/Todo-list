import mongoose from "mongoose";
import { requireApiUser, apiErrorResponse } from "../../../../lib/api-auth";
import { connectMongoDB } from "../../../../lib/mongodb";
import { canManageTodo, canViewTodo, serializeTodo } from "../../../../lib/todos";
import Todo from "../../../../models/Todo";

function isValidId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

export async function GET(_, { params }) {
  try {
    const user = await requireApiUser();
    await connectMongoDB();
    const { id } = await params;

    if (!isValidId(id)) {
      return Response.json(
        { success: false, message: "Invalid todo id." },
        { status: 400 }
      );
    }

    const todo = await Todo.findById(id).populate("ownerId", "username").lean();

    if (!todo) {
      return Response.json(
        { success: false, message: "Todo not found." },
        { status: 404 }
      );
    }

    if (!canViewTodo(user, todo)) {
      return Response.json(
        { success: false, message: "403 Access Denied" },
        { status: 403 }
      );
    }

    return Response.json({ success: true, data: serializeTodo(todo, user) });
  } catch (error) {
    return apiErrorResponse(error, "Failed to fetch todo.");
  }
}

export async function PUT(request, { params }) {
  try {
    const user = await requireApiUser();
    await connectMongoDB();
    const { id } = await params;

    if (!isValidId(id)) {
      return Response.json(
        { success: false, message: "Invalid todo id." },
        { status: 400 }
      );
    }

    const existingTodo = await Todo.findById(id);

    if (!existingTodo) {
      return Response.json(
        { success: false, message: "Todo not found." },
        { status: 404 }
      );
    }

    if (!canManageTodo(user, existingTodo)) {
      return Response.json(
        { success: false, message: "403 Access Denied" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const updateData = {};

    if (typeof body.title === "string") {
      const title = body.title.trim();

      if (!title) {
        return Response.json(
          { success: false, message: "Title cannot be empty." },
          { status: 400 }
        );
      }

      updateData.title = title;
    }

    if (typeof body.description === "string") {
      updateData.description = body.description.trim();
    }

    if (typeof body.type === "string") {
      updateData.type = body.type === "global" ? "global" : "personal";
    }

    if (typeof body.completed === "boolean") {
      updateData.completed = body.completed;
    }

    const todo = await Todo.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate("ownerId", "username")
      .lean();

    return Response.json({ success: true, data: serializeTodo(todo, user) });
  } catch (error) {
    return apiErrorResponse(error, "Failed to update todo.");
  }
}

export const PATCH = PUT;

export async function DELETE(_, { params }) {
  try {
    const user = await requireApiUser();
    await connectMongoDB();
    const { id } = await params;

    if (!isValidId(id)) {
      return Response.json(
        { success: false, message: "Invalid todo id." },
        { status: 400 }
      );
    }

    const existingTodo = await Todo.findById(id);

    if (!existingTodo) {
      return Response.json(
        { success: false, message: "Todo not found." },
        { status: 404 }
      );
    }

    if (!canManageTodo(user, existingTodo)) {
      return Response.json(
        { success: false, message: "403 Access Denied" },
        { status: 403 }
      );
    }

    await Todo.findByIdAndDelete(id);

    return Response.json({ success: true, message: "Todo deleted successfully." });
  } catch (error) {
    return apiErrorResponse(error, "Failed to delete todo.");
  }
}
