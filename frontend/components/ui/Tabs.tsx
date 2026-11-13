"use client";

import React from "react";

export interface TabItem {
  id: string;
  label: string;
  count?: number | string;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeTab, onChange, className = "" }: TabsProps) {
  return (
    <div className={`es-tabs ${className}`.trim()} role="tablist">
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={`es-tab ${isActive ? "active" : ""}`.trim()}
            onClick={() => onChange(tab.id)}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                style={{
                  marginLeft: "0.375rem",
                  fontSize: "0.6875rem",
                  opacity: 0.75,
                }}
              >
                ({tab.count})
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

