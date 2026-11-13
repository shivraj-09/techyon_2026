"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ROLE_NAVIGATION, type UserRole } from "@/config/navigation";
import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";
import type { BreadcrumbItem } from "./Breadcrumbs";

export interface AppLayoutProps {
  children: React.ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  defaultRole?: UserRole;
}

export function AppLayout({
  children,
  breadcrumbs,
  defaultRole = "admin",
}: AppLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const isTeacherRoute =
    defaultRole === "teacher" || pathname.startsWith("/teacher");
  const isParentRoute =
    defaultRole === "parent" || pathname.startsWith("/parent");
  const isAdminRoute = pathname.startsWith("/admin");
  const [role, setRole] = useState<UserRole>(
    isParentRoute
      ? "parent"
      : isTeacherRoute
        ? "teacher"
        : isAdminRoute
          ? "admin"
          : defaultRole,
  );
  const [customEmail, setCustomEmail] = useState<string>("");
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const savedRole = sessionStorage.getItem(
      "edusync_demo_role",
    ) as UserRole | null;
    const savedEmail = sessionStorage.getItem("edusync_demo_email");

    if (isParentRoute) {
      setRole("parent");
      if (savedRole === "parent" && savedEmail) {
        setCustomEmail(savedEmail);
      } else {
        setCustomEmail(ROLE_NAVIGATION.parent.defaultUserEmail);
      }
      return;
    }

    if (isTeacherRoute) {
      setRole("teacher");
      if (savedRole === "teacher" && savedEmail) {
        setCustomEmail(savedEmail);
      } else {
        setCustomEmail(ROLE_NAVIGATION.teacher.defaultUserEmail);
      }
      return;
    }

    if (isAdminRoute) {
      setRole("admin");
      if (savedRole === "admin" && savedEmail) {
        setCustomEmail(savedEmail);
      } else {
        setCustomEmail(ROLE_NAVIGATION.admin.defaultUserEmail);
      }
      return;
    }

    if (savedRole && ROLE_NAVIGATION[savedRole]) {
      setRole(savedRole);
    }
    if (savedEmail) {
      setCustomEmail(savedEmail);
    }
  }, [isAdminRoute, isParentRoute, isTeacherRoute]);

  const currentProfile = ROLE_NAVIGATION[role];
  const resolvedEmail = customEmail || currentProfile.defaultUserEmail;
  const homeHref =
    role === "parent"
      ? "/parent/dashboard"
      : role === "teacher"
        ? "/teacher/dashboard"
        : "/dashboard";
  const settingsHref =
    role === "parent"
      ? "/parent/profile"
      : role === "teacher"
        ? "/teacher/profile"
        : "/dashboard/settings";
  const settingsLabel =
    role === "parent"
      ? "Parent Profile"
      : role === "teacher"
        ? "Teacher Profile"
        : "Workspace Settings";
  const notificationsHref =
    role === "parent"
      ? "/parent/notifications"
      : role === "teacher"
        ? "/teacher/notifications"
        : "/dashboard/notifications";

  function handleToggleSidebar() {
    if (typeof window !== "undefined" && window.innerWidth <= 1024) {
      setMobileOpen((prev) => !prev);
    } else {
      setCollapsed((prev) => !prev);
    }
  }

  function handleRoleChange(nextRole: UserRole) {
    setRole(nextRole);
    const nextEmail = ROLE_NAVIGATION[nextRole].defaultUserEmail;
    setCustomEmail(nextEmail);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("edusync_demo_role", nextRole);
      sessionStorage.setItem("edusync_demo_email", nextEmail);
    }
    if (nextRole === "parent") {
      router.push("/parent/dashboard");
    } else if (nextRole === "teacher") {
      router.push("/teacher/dashboard");
    } else if (nextRole === "admin") {
      router.push("/dashboard");
    }
  }

  function handleLogout() {
    // [DISCONNECTED ENDPOINT] Supabase Sign Out (POST /auth/v1/logout via createClient().auth.signOut)
    // await createClient().auth.signOut();
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("edusync_demo_email");
      sessionStorage.removeItem("edusync_demo_role");
    }
    router.replace("/login");
    router.refresh();
  }

  return (
    <div className="es-app-shell">
      <AppSidebar
        navItems={currentProfile.navItems}
        userName={currentProfile.defaultUserName}
        userRoleLabel={currentProfile.roleLabel}
        homeHref={homeHref}
        settingsHref={settingsHref}
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
        onLogout={handleLogout}
      />

      <div className={`es-main-wrapper ${collapsed ? "collapsed" : ""}`.trim()}>
        <AppHeader
          breadcrumbs={breadcrumbs}
          role={role}
          roleLabel={currentProfile.roleLabel}
          userName={currentProfile.defaultUserName}
          userEmail={resolvedEmail}
          homeHref={homeHref}
          settingsHref={settingsHref}
          settingsLabel={settingsLabel}
          notificationsHref={notificationsHref}
          onToggleSidebar={handleToggleSidebar}
          onRoleChange={handleRoleChange}
          onLogout={handleLogout}
        />

        <main className="es-content">{children}</main>
      </div>
    </div>
  );
}

