export function getUserNavItems() {
  return [
    {
      id: "user-overview",
      href: "/dashboard",
      label: "Dashboard",
      caption: "Overview and stats",
    },
    {
      id: "user-personal",
      href: "/dashboard/personal",
      label: "Personal Todos",
      caption: "Private execution lane",
    },
    {
      id: "user-global",
      href: "/dashboard/global",
      label: "Global Todos",
      caption: "Shared commitments",
    },
    {
      id: "user-settings",
      href: "/settings",
      label: "Settings",
      caption: "Session and security",
    },
  ];
}

export function getAdminNavItems() {
  return [
    {
      id: "admin-dashboard",
      href: "/admin/dashboard",
      label: "Dashboard",
      caption: "System overview",
    },
    {
      id: "admin-users",
      href: "/admin/users",
      label: "Users",
      caption: "Create and control accounts",
    },
    {
      id: "admin-todos",
      href: "/admin/todos",
      label: "All Todos",
      caption: "Cross-user board",
    },
    {
      id: "admin-settings",
      href: "/settings",
      label: "Settings",
      caption: "Session and security",
    },
  ];
}
