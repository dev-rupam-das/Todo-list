import { requireApiUser, apiErrorResponse } from "@/lib/api-auth";
import { connectMongoDB } from "@/lib/mongodb";
import { hashPassword, sanitizeUserDocument } from "@/lib/auth";
import User from "@/models/User";

function normalizeRole(role) {
  return role === "admin" ? "admin" : "user";
}

export async function GET() {
  try {
    await requireApiUser({ adminOnly: true });
    await connectMongoDB();

    const users = await User.find({})
      .sort({ createdAt: -1 })
      .lean();

    return Response.json({
      success: true,
      data: users.map((user) => sanitizeUserDocument(user)),
    });
  } catch (error) {
    return apiErrorResponse(error, "Failed to fetch users.");
  }
}

export async function POST(request) {
  try {
    await requireApiUser({ adminOnly: true });
    await connectMongoDB();

    const body = await request.json();
    const username = body?.username?.trim().toLowerCase() || "";
    const password = body?.password || "";
    const role = normalizeRole(body?.role);

    if (username.length < 3) {
      return Response.json(
        { success: false, message: "Username must be at least 3 characters." },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return Response.json(
        { success: false, message: "Password must be at least 8 characters." },
        { status: 400 }
      );
    }

    const existingUser = await User.findOne({ username }).lean();

    if (existingUser) {
      return Response.json(
        { success: false, message: "Username is already taken." },
        { status: 409 }
      );
    }

    const user = await User.create({
      username,
      password: await hashPassword(password),
      role,
      isActive: body?.isActive ?? true,
    });

    return Response.json(
      {
        success: true,
        data: sanitizeUserDocument(user),
      },
      { status: 201 }
    );
  } catch (error) {
    return apiErrorResponse(error, "Failed to create user.");
  }
}
