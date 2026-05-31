"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton({ className, children = "Logout" }) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", {
      method: "POST",
    });

    router.push("/login");
    router.refresh();
  }

  return (
    <button type="button" className={className} onClick={handleLogout}>
      {children}
    </button>
  );
}
