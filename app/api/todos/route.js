import { NextResponse } from "next/server";
import { connectMongoDB } from "../../../lib/mongodb";
import Todo from "../../../models/Todo";

export async function GET(request) {
  try {
    await connectMongoDB();

    const { searchParams } = new URL(request.url);
    const filter = searchParams.get("filter") || "all";
    const search = searchParams.get("search") || "";

    const query = {};

    if (filter === "active") {
      query.completed = false;
    }

    if (filter === "completed") {
      query.completed = true;
    }

    if (search.trim()) {
      query.$or = [
        { title: { $regex: search.trim(), $options: "i" } },
        { description: { $regex: search.trim(), $options: "i" } },
      ];
    }

    const todos = await Todo.find(query).sort({ createdAt: -1 }).lean();

    return NextResponse.json({ success: true, data: todos });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch todos." },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectMongoDB();

    const body = await request.json();
    const title = body?.title?.trim();
    const description = body?.description?.trim() || "";

    if (!title) {
      return NextResponse.json(
        { success: false, message: "Title is required." },
        { status: 400 }
      );
    }

    const todo = await Todo.create({
      title,
      description,
    });

    return NextResponse.json({ success: true, data: todo }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to create todo." },
      { status: 500 }
    );
  }
}
