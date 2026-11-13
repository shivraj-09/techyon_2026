"use client";

import React, { useMemo, useState } from "react";
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardDescription,
  CardHeader,
  CardTitle,
  EmptyState,
  Icon,
  Select,
  Tabs,
} from "@/components/ui";
import type {
  AiInsightRecord,
  InsightCategory,
  InsightPriority,
} from "@/config/ai-insights-data";

export interface AiInsightCardsSectionProps {
  insights: AiInsightRecord[];
  lastGeneratedLabel: string;
}

const CATEGORIES: InsightCategory[] = [
  "Attendance",
  "Fees",
  "School Operations",
];

export function AiInsightCardsSection({
  insights,
  lastGeneratedLabel,
}: AiInsightCardsSectionProps) {
  const [categoryFilter, setCategoryFilter] = useState<"All" | InsightCategory>(
    "All",
  );
  const [priorityFilter, setPriorityFilter] = useState<"All" | InsightPriority>(
    "All",
  );
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

  function toggleExpanded(id: string) {
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  const filteredInsights = useMemo(() => {
    return insights.filter((item) => {
      const matchCat =
        categoryFilter === "All" || item.category === categoryFilter;
      const matchPri =
        priorityFilter === "All" || item.priority === priorityFilter;
      return matchCat && matchPri;
    });
  }, [insights, categoryFilter, priorityFilter]);

  const groupedByCategory = useMemo(() => {
    const groups: Partial<Record<InsightCategory, AiInsightRecord[]>> = {};
    for (const cat of CATEGORIES) {
      const items = filteredInsights.filter((i) => i.category === cat);
      if (items.length > 0) groups[cat] = items;
    }
    return groups;
  }, [filteredInsights]);

  function getPriorityVariant(
    priority: InsightPriority,
  ): "danger" | "warning" | "neutral" {
    if (priority === "High") return "danger";
    if (priority === "Medium") return "warning";
    return "neutral";
  }

  function getCategoryIcon(category: InsightCategory) {
    if (category === "Attendance") return "calendar-check" as const;
    if (category === "Fees") return "credit-card" as const;
    return "sparkles" as const;
  }

  return (
    <section aria-labelledby="ai-insights-cards-heading" className="es-stack">
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div>
          <h2
            id="ai-insights-cards-heading"
            style={{
              fontSize: "17px",
              fontWeight: 600,
              color: "var(--es-text-primary)",
              margin: 0,
            }}
          >
            AI Insights and Recommendations
          </h2>
          <p
            style={{
              fontSize: "13px",
              color: "var(--es-text-muted)",
              marginTop: "2px",
            }}
          >
            Rule-based observations generated from current attendance and fee
            aggregates (generated {lastGeneratedLabel}).
          </p>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            flexWrap: "wrap",
          }}
        >
          <Tabs
            tabs={[
              { id: "All", label: "All Categories", count: insights.length },
              {
                id: "Attendance",
                label: "Attendance",
                count: insights.filter((i) => i.category === "Attendance")
                  .length,
              },
              {
                id: "Fees",
                label: "Fees",
                count: insights.filter((i) => i.category === "Fees").length,
              },
              {
                id: "School Operations",
                label: "School Operations",
                count: insights.filter(
                  (i) => i.category === "School Operations",
                ).length,
              },
            ]}
            activeTab={categoryFilter}
            onChange={(val) =>
              setCategoryFilter(val as "All" | InsightCategory)
            }
          />
          <div style={{ minWidth: "150px" }}>
            <Select
              aria-label="Filter insights by priority"
              value={priorityFilter}
              onChange={(e) =>
                setPriorityFilter(e.target.value as "All" | InsightPriority)
              }
              options={[
                { value: "All", label: "All Priorities" },
                { value: "High", label: "High Priority" },
                { value: "Medium", label: "Medium Priority" },
                { value: "Low", label: "Low Priority" },
              ]}
            />
          </div>
        </div>
      </div>

      {Object.keys(groupedByCategory).length === 0 ? (
        <Card>
          <CardBody>
            <EmptyState
              icon="filter"
              title="No insights match these filters"
              description="Reset category or priority filters to view all rule-based school insights."
              action={
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setCategoryFilter("All");
                    setPriorityFilter("All");
                  }}
                >
                  Clear Filters
                </Button>
              }
            />
          </CardBody>
        </Card>
      ) : (
        <div className="es-stack">
          {CATEGORIES.map((category) => {
            const items = groupedByCategory[category];
            if (!items || items.length === 0) return null;

            return (
              <div key={category} className="es-stack" style={{ gap: "10px" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "var(--es-text-secondary)",
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                  }}
                >
                  <Icon name={getCategoryIcon(category)} size={15} />
                  <span>{category}</span>
                  <Badge variant="neutral">{items.length}</Badge>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(300px, 1fr))",
                    gap: "14px",
                  }}
                >
                  {items.map((insight) => {
                    const isExpanded = !!expandedIds[insight.id];
                    const isHigh = insight.priority === "High";
                    return (
                      <Card
                        key={insight.id}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          borderLeft: isHigh
                            ? "3px solid var(--es-danger)"
                            : undefined,
                        }}
                      >
                        <CardHeader style={{ paddingBottom: "10px" }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                              flexWrap: "wrap",
                            }}
                          >
                            <Badge variant="primary">{insight.category}</Badge>
                            <Badge variant={getPriorityVariant(insight.priority)}>
                              {insight.priority} Priority
                            </Badge>
                          </div>
                          <span
                            style={{
                              fontSize: "11.5px",
                              color: "var(--es-text-subtle)",
                            }}
                          >
                            {insight.generatedDate}
                          </span>
                        </CardHeader>

                        <CardBody
                          style={{
                            flex: 1,
                            display: "flex",
                            flexDirection: "column",
                            gap: "10px",
                            paddingTop: "4px",
                          }}
                        >
                          <div>
                            <CardTitle
                              style={{ fontSize: "14.5px", lineHeight: 1.4 }}
                            >
                              {insight.title}
                            </CardTitle>
                            <CardDescription
                              style={{ marginTop: "5px", lineHeight: 1.5 }}
                            >
                              {insight.explanation}
                            </CardDescription>
                          </div>

                          <div
                            style={{
                              backgroundColor: "var(--es-bg-subtle)",
                              border: "1px solid var(--es-border)",
                              borderRadius: "var(--es-radius-sm)",
                              padding: "8px 10px",
                              fontSize: "12px",
                              color: "var(--es-text-primary)",
                              fontWeight: 500,
                            }}
                          >
                            <span
                              style={{
                                color: "var(--es-text-muted)",
                                fontWeight: 400,
                              }}
                            >
                              Evidence:{" "}
                            </span>
                            {insight.evidenceMetric}
                          </div>

                          <div
                            style={{
                              fontSize: "12.5px",
                              color: "var(--es-text-secondary)",
                            }}
                          >
                            <strong style={{ color: "var(--es-text-primary)" }}>
                              Suggested action:
                            </strong>{" "}
                            {insight.suggestedAction}
                          </div>

                          {isExpanded && (
                            <div
                              style={{
                                borderTop: "1px solid var(--es-border)",
                                paddingTop: "10px",
                                fontSize: "12px",
                                color: "var(--es-text-muted)",
                                display: "flex",
                                flexDirection: "column",
                                gap: "6px",
                              }}
                            >
                              <div
                                style={{
                                  fontWeight: 600,
                                  color: "var(--es-text-secondary)",
                                }}
                              >
                                {insight.ruleBasis}
                              </div>
                              <ul
                                style={{
                                  margin: 0,
                                  paddingLeft: "18px",
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: "4px",
                                }}
                              >
                                {insight.details.map((detail, idx) => (
                                  <li key={idx}>{detail}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          <div
                            style={{
                              marginTop: "auto",
                              paddingTop: "4px",
                              display: "flex",
                              justifyContent: "flex-end",
                            }}
                          >
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleExpanded(insight.id)}
                            >
                              {isExpanded
                                ? "Hide supporting details"
                                : "View supporting details"}
                            </Button>
                          </div>
                        </CardBody>
                      </Card>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

