import { cookies } from "next/headers";
import { connectMongoDB } from "./mongodb";
import User from "../models/User";
import { SESSION_COOKIE_NAME } from "./auth-config";
import { verifySessionToken } from "./auth";

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

export async function requireApiUser({ adminOnly = false } = {}) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    throw new ApiError("Authentication required.", 401);
  }

  let payload;

  try {
    payload = await verifySessionToken(token);
  } catch {
    throw new ApiError("Invalid session.", 401);
  }

  await connectMongoDB();

  const user = await User.findById(payload.sub).lean();

  if (!user) {
    throw new ApiError("User not found.", 401);
  }

  if (!user.isActive) {
    throw new ApiError("Account is inactive.", 403);
  }

  if (adminOnly && user.role !== "admin") {
    throw new ApiError("403 Access Denied", 403);
  }

  return {
    id: user._id.toString(),
    username: user.username,
    role: user.role,
    isActive: user.isActive,
  };
}

export function apiErrorResponse(error, fallbackMessage) {
  const status = error?.status || 500;
  const message = error?.message || fallbackMessage;

  return Response.json({ success: false, message }, { status });
}
