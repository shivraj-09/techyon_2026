import React from "react";
import { Avatar, Badge, Card, CardBody } from "@/components/ui";
import type { GuardianRecord } from "@/config/stage3-data";

export interface GuardianCardProps {
  guardian: GuardianRecord;
}

export function GuardianCard({ guardian }: GuardianCardProps) {
  return (
    <Card>
      <CardBody>
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "12px",
            marginBottom: "16px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Avatar name={guardian.name} size="md" />
            <div>
              <div
                style={{
                  fontSize: "14.5px",
                  fontWeight: 600,
                  color: "var(--es-text-primary)",
                }}
              >
                {guardian.name}
              </div>
              <div
                style={{
                  fontSize: "12.5px",
                  color: "var(--es-text-muted)",
                  marginTop: "2px",
                }}
              >
                {guardian.relationship}
              </div>
            </div>
          </div>

          {guardian.isPrimary && (
            <Badge variant="primary">Primary Guardian</Badge>
          )}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "12px",
            paddingTop: "12px",
            borderTop: "1px solid var(--es-border-subtle)",
          }}
        >
          <div>
            <div
              style={{
                fontSize: "11.5px",
                color: "var(--es-text-muted)",
                marginBottom: "2px",
              }}
            >
              Phone Number
            </div>
            <div
              style={{
                fontSize: "13px",
                fontWeight: 600,
                color: "var(--es-text-primary)",
              }}
            >
              {guardian.phone}
            </div>
          </div>

          <div>
            <div
              style={{
                fontSize: "11.5px",
                color: "var(--es-text-muted)",
                marginBottom: "2px",
              }}
            >
              Email Address
            </div>
            <div
              style={{
                fontSize: "13px",
                fontWeight: 500,
                color: "var(--es-text-primary)",
              }}
            >
              {guardian.email}
            </div>
          </div>

          {guardian.address && (
            <div style={{ gridColumn: "1 / -1" }}>
              <div
                style={{
                  fontSize: "11.5px",
                  color: "var(--es-text-muted)",
                  marginBottom: "2px",
                }}
              >
                Address
              </div>
              <div
                style={{
                  fontSize: "13px",
                  color: "var(--es-text-secondary)",
                }}
              >
                {guardian.address}
              </div>
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
