"use client";

import React, { useEffect, useRef, useState } from "react";

export interface DropdownItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  danger?: boolean;
  dividerBefore?: boolean;
  onClick?: () => void;
}

export interface DropdownProps {
  trigger: React.ReactNode;
  items?: DropdownItem[];
  children?: React.ReactNode;
  align?: "left" | "right";
  width?: number | string;
}

export function Dropdown({
  trigger,
  items,
  children,
  align = "right",
  width,
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleOutsideClick(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [open]);

  return (
    <div className="es-popover-anchor" ref={containerRef}>
      <div
        onClick={() => setOpen((prev) => !prev)}
        style={{ display: "inline-flex" }}
      >
        {trigger}
      </div>
      {open && (
        <div
          className="es-popover"
          style={{
            right: align === "right" ? 0 : "auto",
            left: align === "left" ? 0 : "auto",
            width: width || undefined,
          }}
        >
          {children ? (
            <div onClick={() => setOpen(false)}>{children}</div>
          ) : (
            items?.map((item) => (
              <React.Fragment key={item.id}>
                {item.dividerBefore && <div className="es-popover-divider" />}
                <button
                  type="button"
                  className={`es-popover-item ${item.danger ? "danger" : ""}`.trim()}
                  onClick={() => {
                    setOpen(false);
                    item.onClick?.();
                  }}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              </React.Fragment>
            ))
          )}
        </div>
      )}
    </div>
  );
}

