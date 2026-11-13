import React from "react";
import {
  Card,
  CardBody,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui";

export interface InfoFieldItem {
  label: string;
  value: React.ReactNode;
}

export interface StudentInformationCardProps {
  title: string;
  description?: string;
  fields: InfoFieldItem[];
}

export function StudentInformationCard({
  title,
  description,
  fields,
}: StudentInformationCardProps) {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
      </CardHeader>
      <CardBody>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "18px 24px",
          }}
        >
          {fields.map((field) => (
            <div key={field.label}>
              <div
                style={{
                  fontSize: "12px",
                  fontWeight: 500,
                  color: "var(--es-text-muted)",
                  marginBottom: "4px",
                }}
              >
                {field.label}
              </div>
              <div
                style={{
                  fontSize: "13.5px",
                  fontWeight: 600,
                  color: "var(--es-text-primary)",
                  lineHeight: 1.4,
                }}
              >
                {field.value || "—"}
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
