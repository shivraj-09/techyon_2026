"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardDescription,
  CardHeader,
  CardTitle,
  Icon,
  Modal,
} from "@/components/ui";
import type { RecommendedActionRecord } from "@/config/ai-insights-data";

export interface RecommendedActionsSectionProps {
  actions: RecommendedActionRecord[];
}

export function RecommendedActionsSection({
  actions,
}: RecommendedActionsSectionProps) {
  const [selectedAction, setSelectedAction] =
    useState<RecommendedActionRecord | null>(null);

  function getPriorityVariant(
    priority: RecommendedActionRecord["priority"],
  ): "danger" | "warning" | "neutral" {
    if (priority === "High") return "danger";
    if (priority === "Medium") return "warning";
    return "neutral";
  }

  return (
    <section aria-labelledby="ai-recommended-heading" className="es-stack">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "8px",
        }}
      >
        <div>
          <h2
            id="ai-recommended-heading"
            style={{
              fontSize: "17px",
              fontWeight: 600,
              color: "var(--es-text-primary)",
              margin: 0,
            }}
          >
            Recommended Actions
          </h2>
          <p
            style={{
              fontSize: "13px",
              color: "var(--es-text-muted)",
              marginTop: "2px",
            }}
          >
            Suggested administrative follow-ups queued for human review — none
            of these actions run automatically.
          </p>
        </div>
        <Badge variant="neutral">{actions.length} pending review</Badge>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "14px",
        }}
      >
        {actions.map((action) => (
          <Card
            key={action.id}
            style={{ display: "flex", flexDirection: "column" }}
          >
            <CardHeader style={{ paddingBottom: "10px" }}>
              <CardTitle style={{ fontSize: "14.5px" }}>
                {action.title}
              </CardTitle>
              <Badge variant={getPriorityVariant(action.priority)}>
                {action.priority}
              </Badge>
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
              <CardDescription style={{ lineHeight: 1.5 }}>
                {action.whySuggested}
              </CardDescription>

              <div
                style={{
                  fontSize: "12px",
                  color: "var(--es-text-secondary)",
                  backgroundColor: "var(--es-bg-subtle)",
                  border: "1px solid var(--es-border)",
                  borderRadius: "var(--es-radius-sm)",
                  padding: "8px 10px",
                }}
              >
                <strong style={{ color: "var(--es-text-primary)" }}>
                  Supporting metric:
                </strong>{" "}
                {action.evidence}
              </div>

              <div
                style={{
                  marginTop: "auto",
                  paddingTop: "4px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "8px",
                  flexWrap: "wrap",
                }}
              >
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setSelectedAction(action)}
                >
                  Review Checklist
                </Button>
                <Link href={action.targetRoute}>
                  <Button
                    variant="primary"
                    size="sm"
                    rightIcon={<Icon name="arrow-up-right" size={14} />}
                  >
                    {action.actionLabel}
                  </Button>
                </Link>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      <Modal
        isOpen={!!selectedAction}
        onClose={() => setSelectedAction(null)}
        title={selectedAction?.title || "Recommended Action"}
        description={selectedAction?.ruleSource}
        footer={
          selectedAction && (
            <>
              <Button
                variant="secondary"
                size="md"
                onClick={() => setSelectedAction(null)}
              >
                Close
              </Button>
              <Link href={selectedAction.targetRoute}>
                <Button
                  variant="primary"
                  size="md"
                  rightIcon={<Icon name="arrow-up-right" size={14} />}
                >
                  {selectedAction.actionLabel}
                </Button>
              </Link>
            </>
          )
        }
      >
        {selectedAction && (
          <div className="es-stack" style={{ gap: "12px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                flexWrap: "wrap",
              }}
            >
              <Badge variant={getPriorityVariant(selectedAction.priority)}>
                {selectedAction.priority} Priority
              </Badge>
              <Badge variant="neutral">Status: Pending admin review</Badge>
            </div>

            <div style={{ fontSize: "13.5px", lineHeight: 1.55 }}>
              <strong style={{ color: "var(--es-text-primary)" }}>
                Why suggested:
              </strong>{" "}
              <span style={{ color: "var(--es-text-secondary)" }}>
                {selectedAction.whySuggested}
              </span>
            </div>

            <div
              style={{
                padding: "10px 12px",
                borderRadius: "var(--es-radius-sm)",
                backgroundColor: "var(--es-bg-subtle)",
                border: "1px solid var(--es-border)",
                fontSize: "12.5px",
              }}
            >
              <strong>Supporting evidence:</strong> {selectedAction.evidence}
            </div>

            <div>
              <div
                style={{
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "var(--es-text-primary)",
                  marginBottom: "6px",
                }}
              >
                Suggested review steps
              </div>
              <ul
                style={{
                  margin: 0,
                  paddingLeft: "18px",
                  fontSize: "13px",
                  color: "var(--es-text-secondary)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                }}
              >
                {selectedAction.reviewSteps.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </Modal>
    </section>
  );
}

