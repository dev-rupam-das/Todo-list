import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { connectMongoDB } from "./mongodb";
import { SESSION_COOKIE_NAME } from "./auth-config";
import User from "../models/User";

const encoder = new TextEncoder();

function getJwtSecret() {
  const secret = process.env.JWT_SECRET || process.env.AUTH_SECRET;

  if (!secret) {
    throw new Error("Missing JWT_SECRET. Add it to your environment before using authentication.");
  }

  return encoder.encode(secret);
}

function normalizeUser(user) {
  if (!user) {
    return null;
  }

  return {
    id: user._id.toString(),
    username: user.username,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export async function hashPassword(password) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password, hashedPassword) {
  return bcrypt.compare(password, hashedPassword);
}

export async function createSessionToken(user) {
  return new SignJWT({
    role: user.role,
    username: user.username,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user._id.toString())
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getJwtSecret());
}

export async function verifySessionToken(token) {
  const { payload } = await jwtVerify(token, getJwtSecret());
  return payload;
}

export async function setSessionCookie(token) {
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export const getCurrentUser = cache(async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  try {
    const payload = await verifySessionToken(token);
    await connectMongoDB();

    const user = await User.findById(payload.sub).lean();

    if (!user || !user.isActive) {
      return null;
    }

    return normalizeUser(user);
  } catch {
    return null;
  }
});

export async function requireAuthenticatedUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function requireAdminUser() {
  const user = await requireAuthenticatedUser();

  if (user.role !== "admin") {
    redirect("/forbidden");
  }

  return user;
}

export async function authenticateCredentials(username, password) {
  await connectMongoDB();

  const normalizedUsername = username.trim().toLowerCase();
  const user = await User.findOne({ username: normalizedUsername }).select("+password");

  if (!user || !user.isActive) {
    return null;
  }

  const isValidPassword = await verifyPassword(password, user.password);

  if (!isValidPassword) {
    return null;
  }

  return user;
}

export function buildSessionUser(user) {
  return {
    _id: user._id,
    username: user.username,
    role: user.role,
  };
}

export function sanitizeUserDocument(user) {
  return normalizeUser(user);
}
