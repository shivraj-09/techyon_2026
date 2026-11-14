"use client";

import React from "react";
import { Icon } from "./Icon";

export interface PaginationProps {
  page: number;
  totalPages: number;
  totalItems?: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({
  page,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  className = "",
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const safePage = Math.max(1, Math.min(page, totalPages));
  const pages: number[] = [];
  const start = Math.max(1, safePage - 1);
  const end = Math.min(totalPages, safePage + 1);
  for (let p = start; p <= end; p += 1) {
    pages.push(p);
  }

  let rangeText = `Page ${safePage} of ${totalPages}`;
  if (typeof totalItems === "number" && typeof pageSize === "number") {
    const first = (safePage - 1) * pageSize + 1;
    const last = Math.min(safePage * pageSize, totalItems);
    rangeText = `Showing ${first}-${last} of ${totalItems}`;
  }

  return (
    <nav
      className={`es-pagination ${className}`.trim()}
      aria-label="Pagination"
    >
      <span style={{ fontSize: "12.5px", color: "var(--es-text-muted)" }}>
        {rangeText}
      </span>
      <div className="es-pagination-controls">
        <button
          type="button"
          className="es-page-btn"
          disabled={safePage <= 1}
          onClick={() => onPageChange(safePage - 1)}
          aria-label="Previous page"
        >
          <Icon name="arrow-left" size={14} />
        </button>

        {start > 1 && (
          <>
            <button
              type="button"
              className="es-page-btn"
              onClick={() => onPageChange(1)}
            >
              1
            </button>
            {start > 2 && (
              <span style={{ color: "var(--es-text-subtle)", padding: "0 4px" }}>
                ...
              </span>
            )}
          </>
        )}

        {pages.map((p) => (
          <button
            key={p}
            type="button"
            className={`es-page-btn ${p === safePage ? "active" : ""}`.trim()}
            onClick={() => onPageChange(p)}
            aria-current={p === safePage ? "page" : undefined}
          >
            {p}
          </button>
        ))}

        {end < totalPages && (
          <>
            {end < totalPages - 1 && (
              <span style={{ color: "var(--es-text-subtle)", padding: "0 4px" }}>
                ...
              </span>
            )}
            <button
              type="button"
              className="es-page-btn"
              onClick={() => onPageChange(totalPages)}
            >
              {totalPages}
            </button>
          </>
        )}

        <button
          type="button"
          className="es-page-btn"
          disabled={safePage >= totalPages}
          onClick={() => onPageChange(safePage + 1)}
          aria-label="Next page"
        >
          <Icon name="arrow-right" size={14} />
        </button>
      </div>
    </nav>
  );
}

