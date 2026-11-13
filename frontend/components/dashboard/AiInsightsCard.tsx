"use client";

import React from "react";
import Link from "next/link";
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Icon,
} from "@/components/ui";
import { AI_SCHOOL_INSIGHTS } from "@/config/admin-dashboard-data";

export function AiInsightsCard() {
  return (
    <Card style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <CardHeader>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span
            style={{
              width: 28,
              height: 28,
              borderRadius: "var(--es-radius-sm)",
              backgroundColor: "var(--es-primary-subtle)",
              color: "var(--es-primary)",
              border: "1px solid var(--es-primary-border)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon name="sparkles" size={15} />
          </span>
          <div>
            <CardTitle>AI School Insights</CardTitle>
            <CardDescription>
              Automated patterns detected across school records
            </CardDescription>
          </div>
        </div>
        <Badge variant="primary">AI Preview</Badge>
      </CardHeader>

      <CardBody
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        {AI_SCHOOL_INSIGHTS.map((insight) => {
          const isWarning = insight.severity === "warning";
          return (
            <div key={insight.id} className="es-insight-card">
              <span
                className="es-insight-icon"
                style={{
                  backgroundColor: isWarning
                    ? "var(--es-warning-bg)"
                    : "var(--es-success-bg)",
                  color: isWarning ? "var(--es-warning)" : "var(--es-success)",
                  border: `1px solid ${
                    isWarning
                      ? "var(--es-warning-border)"
                      : "var(--es-success-border)"
                  }`,
                }}
              >
                <Icon
                  name={isWarning ? "trending-down" : "trending-up"}
                  size={15}
                />
              </span>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                    color: isWarning
                      ? "var(--es-warning)"
                      : "var(--es-success)",
                    marginBottom: "3px",
                  }}
                >
                  {insight.category}
                </div>
                <div
                  style={{
                    fontSize: "13.5px",
                    fontWeight: 500,
                    color: "var(--es-text-primary)",
                    lineHeight: 1.45,
                  }}
                >
                  &ldquo;{insight.text}&rdquo;
                </div>
              </div>
            </div>
          );
        })}
      </CardBody>

      <CardFooter>
        <span style={{ fontSize: "12px", color: "var(--es-text-muted)" }}>
          2 active insights generated today
        </span>
        <Link href="/dashboard/ai-insights">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Icon name="sparkles" size={14} />}
          >
            View AI Insights
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}

