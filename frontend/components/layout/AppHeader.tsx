"use client";

import React from "react";
import { Icon } from "@/components/ui/Icon";
import type { UserRole } from "@/config/navigation";
import { Breadcrumbs, type BreadcrumbItem } from "./Breadcrumbs";
import { SearchBar } from "./SearchBar";
import { NotificationButton } from "./NotificationButton";
import { UserMenu } from "./UserMenu";
import { ThemeSwitcher } from "@/components/theme/ThemeSwitcher";

export interface AppHeaderProps {
  breadcrumbs?: BreadcrumbItem[];
  role: UserRole;
  roleLabel: string;
  userName: string;
  userEmail: string;
  homeHref?: string;
  settingsHref?: string;
  settingsLabel?: string;
  notificationsHref?: string;
  onToggleSidebar: () => void;
  onRoleChange: (role: UserRole) => void;
  onLogout: () => void;
}

export function AppHeader({
  breadcrumbs,
  role,
  roleLabel,
  userName,
  userEmail,
  homeHref,
  settingsHref,
  settingsLabel,
  notificationsHref,
  onToggleSidebar,
  onRoleChange,
  onLogout,
}: AppHeaderProps) {
  return (
    <header className="es-header">
      <div className="es-header-left">
        <button
          type="button"
          className="es-icon-btn"
          onClick={onToggleSidebar}
          aria-label="Toggle navigation sidebar"
          title="Toggle sidebar"
        >
          <Icon name="panel-left" size={17} />
        </button>
        <Breadcrumbs
          items={breadcrumbs}
          roleLabel={roleLabel}
          homeHref={homeHref}
        />
      </div>

      <div className="es-header-right">
        <SearchBar />
        <div className="es-header-theme-wrap">
          <ThemeSwitcher variant="compact" />
        </div>
        <NotificationButton notificationsHref={notificationsHref} />
        <UserMenu
          userName={userName}
          userEmail={userEmail}
          role={role}
          settingsHref={settingsHref}
          settingsLabel={settingsLabel}
          onRoleChange={onRoleChange}
          onLogout={onLogout}
        />
      </div>
    </header>
  );
}

