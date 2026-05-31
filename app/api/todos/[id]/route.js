import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectMongoDB } from "../../../../lib/mongodb";
import Todo from "../../../../models/Todo";

function isValidId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

export async function GET(_, { params }) {
  try {
    await connectMongoDB();
    const { id } = await params;

    if (!isValidId(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid todo id." },
        { status: 400 }
      );
    }

    const todo = await Todo.findById(id).lean();

    if (!todo) {
      return NextResponse.json(
        { success: false, message: "Todo not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: todo });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch todo." },
      { status: 500 }
    );
  }
}

export async function PATCH(request, { params }) {
  try {
    await connectMongoDB();
    const { id } = await params;

    if (!isValidId(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid todo id." },
        { status: 400 }
      );
    }

    const body = await request.json();
    const updateData = {};

    if (typeof body.title === "string") {
      const title = body.title.trim();

      if (!title) {
        return NextResponse.json(
          { success: false, message: "Title cannot be empty." },
          { status: 400 }
        );
      }

      updateData.title = title;
    }

    if (typeof body.description === "string") {
      updateData.description = body.description.trim();
    }

    if (typeof body.completed === "boolean") {
      updateData.completed = body.completed;
    }

    const todo = await Todo.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).lean();

    if (!todo) {
      return NextResponse.json(
        { success: false, message: "Todo not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: todo });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update todo." },
      { status: 500 }
    );
  }
}

export async function DELETE(_, { params }) {
  try {
    await connectMongoDB();
    const { id } = await params;

    if (!isValidId(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid todo id." },
        { status: 400 }
      );
    }

    const todo = await Todo.findByIdAndDelete(id).lean();

    if (!todo) {
      return NextResponse.json(
        { success: false, message: "Todo not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: "Todo deleted successfully." });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to delete todo." },
      { status: 500 }
    );
  }
}
