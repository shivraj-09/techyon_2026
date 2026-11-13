"use client";

import React, { useState } from "react";
import { Icon } from "@/components/ui/Icon";

export interface SearchBarProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
}

export function SearchBar({
  placeholder = "Search students, classes, records...",
  value,
  onChange,
}: SearchBarProps) {
  const [internalQuery, setInternalQuery] = useState("");
  const currentValue = value !== undefined ? value : internalQuery;

  return (
    <div className="es-search-wrapper" role="search">
      <Icon name="search" size={15} className="es-search-icon" />
      <input
        type="search"
        className="es-search-input"
        placeholder={placeholder}
        value={currentValue}
        onChange={(e) => {
          setInternalQuery(e.target.value);
          onChange?.(e.target.value);
        }}
        aria-label={placeholder}
      />
      <kbd className="es-search-kbd" aria-hidden="true">
        /
      </kbd>
    </div>
  );
}

