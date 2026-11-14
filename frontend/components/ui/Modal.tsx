"use client";

import React, { useEffect } from "react";
import { Icon } from "./Icon";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
}: ModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="es-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="es-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="es-modal">
        <div className="es-modal-header">
          <div>
            <h2 id="es-modal-title" className="es-modal-title">
              {title}
            </h2>
            {description && (
              <p
                className="es-card-subtitle"
                style={{ marginTop: "0.25rem" }}
              >
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            className="es-icon-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            <Icon name="x" size={16} />
          </button>
        </div>
        <div className="es-modal-body">{children}</div>
        {footer && <div className="es-modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

