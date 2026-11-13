"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { Icon } from "@/components/ui/Icon";
import { ROLE_NAVIGATION, type UserRole } from "@/config/navigation";

export interface UserMenuProps {
  userName: string;
  userEmail: string;
  role: UserRole;
  settingsHref?: string;
  settingsLabel?: string;
  onRoleChange: (role: UserRole) => void;
  onLogout: () => void;
}

export function UserMenu({
  userName,
  userEmail,
  role,
  settingsHref,
  settingsLabel,
  onRoleChange,
  onLogout,
}: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const roleConfig = ROLE_NAVIGATION[role];
  const resolvedSettingsHref =
    settingsHref ??
    (role === "teacher" ? "/teacher/profile" : "/dashboard/settings");
  const resolvedSettingsLabel =
    settingsLabel ??
    (role === "teacher" ? "Teacher Profile" : "Workspace Settings");

  useEffect(() => {
    if (!open) return;
    function handleOutsideClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [open]);

  return (
    <div className="es-popover-anchor" ref={containerRef}>
      <button
        type="button"
        className="es-user-trigger"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <Avatar name={userName} size="sm" />
        <span className="es-user-trigger-name">{userName}</span>
        <Icon
          name="chevron-down"
          size={14}
          style={{ color: "var(--es-text-subtle)" }}
        />
      </button>

      {open && (
        <div className="es-popover" role="menu">
          <div className="es-popover-header">
            <div
              style={{
                fontSize: "0.8125rem",
                fontWeight: 600,
                color: "var(--es-text)",
              }}
            >
              {userName}
            </div>
            <div
              style={{
                fontSize: "0.75rem",
                color: "var(--es-text-muted)",
                marginTop: "0.125rem",
              }}
            >
              {userEmail}
            </div>
            <div style={{ marginTop: "0.375rem" }}>
              <span className="es-badge es-badge-primary">
                {roleConfig.roleLabel}
              </span>
            </div>
          </div>

          {/* Role Switcher for Layout Preview */}
          <div
            style={{
              padding: "0.375rem 0.625rem",
              fontSize: "0.6875rem",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: "var(--es-text-subtle)",
            }}
          >
            Workspace
          </div>
          {(["admin", "teacher", "parent", "counsellor"] as UserRole[]).map((r) => {
            const active = r === role;
            return (
              <button
                key={r}
                type="button"
                role="menuitem"
                className="es-popover-item"
                style={{
                  fontWeight: active ? 600 : 500,
                  color: active ? "var(--es-primary)" : undefined,
                  background: active ? "var(--es-primary-light)" : undefined,
                }}
                onClick={() => {
                  onRoleChange(r);
                  setOpen(false);
                }}
              >
                <Icon name="user" size={14} />
                <span>{ROLE_NAVIGATION[r].roleLabel}</span>
              </button>
            );
          })}

          <div className="es-popover-divider" />

          <Link
            href={resolvedSettingsHref}
            role="menuitem"
            className="es-popover-item"
            onClick={() => setOpen(false)}
          >
            <Icon name="settings" size={15} />
            <span>{resolvedSettingsLabel}</span>
          </Link>

          <button
            type="button"
            role="menuitem"
            className="es-popover-item danger"
            onClick={() => {
              setOpen(false);
              onLogout();
            }}
          >
            <Icon name="log-out" size={15} />
            <span>Sign out</span>
          </button>
        </div>
      )}
    </div>
  );
}

