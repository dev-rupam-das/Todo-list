import { redirect } from "next/navigation";
import { requireAuthenticatedUser } from "../../lib/auth";

export const dynamic = "force-dynamic";

export default async function LegacyTodosPage() {
  const user = await requireAuthenticatedUser();

  redirect(user.role === "admin" ? "/admin/todos" : "/dashboard/personal");
}
