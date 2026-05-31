import mongoose from "mongoose";
import { requireApiUser, apiErrorResponse } from "@/lib/api-auth";
import { connectMongoDB } from "@/lib/mongodb";
import { hashPassword, sanitizeUserDocument } from "@/lib/auth";
import User from "@/models/User";
import Todo from "@/models/Todo";

function isValidId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

function normalizeRole(role) {
  return role === "admin" ? "admin" : "user";
}

export async function PUT(request, { params }) {
  try {
    const currentUser = await requireApiUser({ adminOnly: true });
    await connectMongoDB();

    const { id } = await params;

    if (!isValidId(id)) {
      return Response.json(
        { success: false, message: "Invalid user id." },
        { status: 400 }
      );
    }

    const body = await request.json();
    const updateData = {};

    if (typeof body.username === "string") {
      const username = body.username.trim().toLowerCase();

      if (username.length < 3) {
        return Response.json(
          { success: false, message: "Username must be at least 3 characters." },
          { status: 400 }
        );
      }

      const duplicate = await User.findOne({ username, _id: { $ne: id } }).lean();

      if (duplicate) {
        return Response.json(
          { success: false, message: "Username is already taken." },
          { status: 409 }
        );
      }

      updateData.username = username;
    }

    if (typeof body.role === "string") {
      updateData.role = normalizeRole(body.role);
    }

    if (typeof body.isActive === "boolean") {
      updateData.isActive = body.isActive;
    }

    if (typeof body.password === "string" && body.password.trim()) {
      if (body.password.length < 8) {
        return Response.json(
          { success: false, message: "Password must be at least 8 characters." },
          { status: 400 }
        );
      }

      updateData.password = await hashPassword(body.password);
    }

    if (currentUser.id === id && updateData.isActive === false) {
      return Response.json(
        { success: false, message: "You cannot deactivate your own account." },
        { status: 400 }
      );
    }

    const user = await User.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).lean();

    if (!user) {
      return Response.json(
        { success: false, message: "User not found." },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      data: sanitizeUserDocument(user),
    });
  } catch (error) {
    return apiErrorResponse(error, "Failed to update user.");
  }
}

export async function DELETE(_, { params }) {
  try {
    const currentUser = await requireApiUser({ adminOnly: true });
    await connectMongoDB();

    const { id } = await params;

    if (!isValidId(id)) {
      return Response.json(
        { success: false, message: "Invalid user id." },
        { status: 400 }
      );
    }

    if (currentUser.id === id) {
      return Response.json(
        { success: false, message: "You cannot delete your own account." },
        { status: 400 }
      );
    }

    const user = await User.findByIdAndDelete(id).lean();

    if (!user) {
      return Response.json(
        { success: false, message: "User not found." },
        { status: 404 }
      );
    }

    await Todo.deleteMany({ ownerId: id });

    return Response.json({
      success: true,
      message: "User deleted successfully.",
    });
  } catch (error) {
    return apiErrorResponse(error, "Failed to delete user.");
  }
}
