"use client";

import React from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import type { NavItemConfig } from "@/config/navigation";

export interface SidebarNavItemProps {
  item: NavItemConfig;
  isActive: boolean;
  collapsed?: boolean;
  onClick?: () => void;
}

export function SidebarNavItem({
  item,
  isActive,
  collapsed = false,
  onClick,
}: SidebarNavItemProps) {
  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={`es-nav-item ${isActive ? "active" : ""}`.trim()}
      title={collapsed ? item.label : undefined}
      aria-current={isActive ? "page" : undefined}
    >
      <Icon name={item.icon} size={18} className="es-nav-item-icon" />
      <span className="es-nav-item-label">{item.label}</span>
      {item.badge && <span className="es-nav-badge">{item.badge}</span>}
    </Link>
  );
}

