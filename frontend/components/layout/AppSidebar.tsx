"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Avatar } from "@/components/ui/Avatar";
import { Icon } from "@/components/ui/Icon";
import type { NavItemConfig } from "@/config/navigation";
import { SidebarNavItem } from "./SidebarNavItem";

export interface AppSidebarProps {
  navItems: NavItemConfig[];
  userName: string;
  userRoleLabel: string;
  homeHref?: string;
  settingsHref?: string;
  collapsed: boolean;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  onLogout: () => void;
}

export function AppSidebar({
  navItems,
  userName,
  userRoleLabel,
  homeHref = "/dashboard",
  settingsHref = "/dashboard/settings",
  collapsed,
  mobileOpen,
  onCloseMobile,
  onLogout,
}: AppSidebarProps) {
  const pathname = usePathname();

  function checkIsActive(href: string) {
    if (
      href === "/dashboard" ||
      href === "/teacher/dashboard" ||
      href === "/parent/dashboard" ||
      href === "/counsellor/dashboard" ||
      href === "/student/voice" ||
      href === "/teacher/referrals/new"
    ) {
      return pathname === href;
    }
    if (href === "/teacher/referrals") {
      return (
        pathname === "/teacher/referrals" ||
        (pathname.startsWith("/teacher/referrals/") &&
          pathname !== "/teacher/referrals/new")
      );
    }
    const normalizeAdminPath = (path: string) =>
      path.startsWith("/admin/") ? path.replace(/^\/admin\//, "/dashboard/") : path;
    const normalizedPathname = normalizeAdminPath(pathname);
    const normalizedHref = normalizeAdminPath(href);
    return (
      normalizedPathname === normalizedHref ||
      normalizedPathname.startsWith(`${normalizedHref}/`)
    );
  }

  return (
    <>
      <div
        className={`es-sidebar-backdrop ${mobileOpen ? "open" : ""}`.trim()}
        onClick={onCloseMobile}
        aria-hidden="true"
      />
      <aside
        className={`es-sidebar ${collapsed ? "collapsed" : ""} ${
          mobileOpen ? "mobile-open" : ""
        }`.trim()}
        aria-label="Primary Sidebar Navigation"
      >
        {/* Brand Header */}
        <div className="es-sidebar-header">
          <Link
            href={homeHref}
            className="es-brand-link"
            onClick={onCloseMobile}
          >
            <span className="es-brand-mark">
              <Image src="/circle-logo.svg" alt="" width={28} height={28} className="es-brand-logo-image" priority />
            </span>
            <span className="es-brand-text">
              <span className="es-brand-title">CIRCLE</span>
              <span className="es-brand-subtitle">School OS</span>
            </span>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="es-sidebar-nav" aria-label="Workspace modules">
          <div className="es-nav-section-label">Navigation</div>
          {navItems.map((item) => (
            <SidebarNavItem
              key={item.id}
              item={item}
              isActive={checkIsActive(item.href)}
              collapsed={collapsed}
              onClick={onCloseMobile}
            />
          ))}
        </nav>

        {/* Bottom User Profile & Logout Section */}
        <div className="es-sidebar-footer">
          <div className="es-user-card">
            <Avatar name={userName} size="md" />
            <div className="es-user-info">
              <div className="es-user-name" title={userName}>
                {userName}
              </div>
              <div className="es-user-role" title={userRoleLabel}>
                {userRoleLabel}
              </div>
            </div>
            <div className="es-user-actions">
              <Link
                href={settingsHref}
                className="es-icon-btn"
                style={{ width: 28, height: 28, border: "none" }}
                title="Profile & Settings"
                aria-label="Profile & Settings"
                onClick={onCloseMobile}
              >
                <Icon name="settings" size={15} />
              </Link>
              <button
                type="button"
                className="es-icon-btn"
                style={{ width: 28, height: 28, border: "none" }}
                title="Sign out"
                aria-label="Sign out"
                onClick={onLogout}
              >
                <Icon name="log-out" size={15} />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

