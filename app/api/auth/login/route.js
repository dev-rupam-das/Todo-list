import {
  authenticateCredentials,
  buildSessionUser,
  createSessionToken,
  sanitizeUserDocument,
  setSessionCookie,
} from "@/lib/auth";

export async function POST(request) {
  try {
    const body = await request.json();
    const username = body?.username?.trim() || "";
    const password = body?.password || "";

    if (!username || !password) {
      return Response.json(
        { success: false, message: "Username and password are required." },
        { status: 400 }
      );
    }

    const user = await authenticateCredentials(username, password);

    if (!user) {
      return Response.json(
        { success: false, message: "Invalid credentials." },
        { status: 401 }
      );
    }

    const token = await createSessionToken(buildSessionUser(user));
    await setSessionCookie(token);

    return Response.json({
      success: true,
      data: {
        user: sanitizeUserDocument(user),
        redirectTo: user.role === "admin" ? "/admin/dashboard" : "/dashboard",
      },
    });
  } catch (error) {
    return Response.json(
      { success: false, message: error.message || "Login failed." },
      { status: 500 }
    );
  }
}
