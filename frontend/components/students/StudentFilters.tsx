"use client";

import React from "react";
import { Button, Icon, Input, Select } from "@/components/ui";
import { CLASS_OPTIONS } from "@/config/stage3-data";

export interface StudentFiltersProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  classFilter: string;
  onClassFilterChange: (val: string) => void;
  statusFilter: string;
  onStatusFilterChange: (val: string) => void;
  onClearFilters: () => void;
  totalCount: number;
  filteredCount: number;
}

export function StudentFilters({
  searchQuery,
  onSearchChange,
  classFilter,
  onClassFilterChange,
  statusFilter,
  onStatusFilterChange,
  onClearFilters,
  totalCount,
  filteredCount,
}: StudentFiltersProps) {
  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    classFilter !== "all" ||
    statusFilter !== "all";

  const classSelectOptions = [
    { value: "all", label: "All Classes" },
    ...CLASS_OPTIONS.map((cls) => ({ value: cls.name, label: cls.name })),
    { value: "Unassigned", label: "Unassigned" },
  ];

  const statusSelectOptions = [
    { value: "all", label: "All Statuses" },
    { value: "Active", label: "Active" },
    { value: "Inactive", label: "Inactive" },
  ];

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "12px",
        flexWrap: "wrap",
        padding: "14px 20px",
        backgroundColor: "var(--es-bg-surface)",
        borderBottom: "1px solid var(--es-border-subtle)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          flexWrap: "wrap",
          flex: "1 1 520px",
        }}
      >
        <div style={{ flex: "1 1 260px", maxWidth: "360px" }}>
          <Input
            type="search"
            placeholder="Search by student name or ID (e.g. STU-2026)..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            leftIcon={<Icon name="search" size={15} />}
            aria-label="Search students by name or ID"
          />
        </div>

        <div style={{ width: "165px" }}>
          <Select
            aria-label="Filter by class"
            value={classFilter}
            onChange={(e) => onClassFilterChange(e.target.value)}
            options={classSelectOptions}
          />
        </div>

        <div style={{ width: "150px" }}>
          <Select
            aria-label="Filter by status"
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            options={statusSelectOptions}
          />
        </div>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            leftIcon={<Icon name="x" size={14} />}
          >
            Clear filters
          </Button>
        )}
      </div>

      <div
        style={{
          fontSize: "12.5px",
          color: "var(--es-text-muted)",
          whiteSpace: "nowrap",
        }}
      >
        Showing{" "}
        <strong style={{ color: "var(--es-text-primary)" }}>
          {filteredCount}
        </strong>{" "}
        of{" "}
        <strong style={{ color: "var(--es-text-primary)" }}>
          {totalCount}
        </strong>{" "}
        students
      </div>
    </div>
  );
}
