"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AppLayout, PageHeader } from "@/components/layout";
import {
  Badge,
  Button,
  Card,
  CardBody,
  EmptyState,
  Icon,
} from "@/components/ui";
import { ChildCard, ChildSelector } from "@/components/parent";
import {
  PARENT_CHILDREN,
  getSelectedChildId,
  saveSelectedChildId,
  type ParentChildRecord,
} from "@/config/parent-data";

export default function ParentChildrenPage() {
  const [selectedChildId, setSelectedChildId] = useState<string>(
    PARENT_CHILDREN[0]?.id ?? "stu-1024",
  );
  const [simulateEmpty, setSimulateEmpty] = useState(false);

  useEffect(() => {
    setSelectedChildId(getSelectedChildId());
  }, []);

  const visibleChildren: ParentChildRecord[] = simulateEmpty
    ? []
    : PARENT_CHILDREN;

  function handleSelectChildId(id: string) {
    setSelectedChildId(id);
    saveSelectedChildId(id);
  }

  return (
    <AppLayout
      defaultRole="parent"
      breadcrumbs={[
        { label: "Parent", href: "/parent/dashboard" },
        { label: "My Children" },
      ]}
    >
      <div className="es-stack">
        <PageHeader
          title="My Children"
          subtitle="View your children's academic and school information."
          actions={
            <>
              <Badge variant="neutral">
                {visibleChildren.length} Linked Child
                {visibleChildren.length === 1 ? "" : "ren"}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<Icon name="users" size={14} />}
                onClick={() => setSimulateEmpty((prev) => !prev)}
              >
                {simulateEmpty
                  ? "Show Linked Children"
                  : "Preview Empty State"}
              </Button>
            </>
          }
        />

        {visibleChildren.length === 0 ? (
          <Card>
            <CardBody>
              <EmptyState
                icon="users"
                title="No children linked to your account"
                description="Your guardian account currently has no linked student records. Please contact the school administration office if you expect to see a student profile here."
                action={
                  <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                    <Button
                      variant="primary"
                      onClick={() => setSimulateEmpty(false)}
                    >
                      Restore Linked Children
                    </Button>
                    <Link
                      href="/parent/dashboard"
                      style={{ textDecoration: "none" }}
                    >
                      <Button variant="secondary">Back to Dashboard</Button>
                    </Link>
                  </div>
                }
              />
            </CardBody>
          </Card>
        ) : (
          <>
            <ChildSelector
              childrenList={visibleChildren}
              selectedChildId={selectedChildId}
              onSelectChild={handleSelectChildId}
              label="Active Child:"
            />

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                gap: "16px",
              }}
            >
              {visibleChildren.map((child) => (
                <ChildCard
                  key={child.id}
                  child={child}
                  selected={child.id === selectedChildId}
                  onSelect={(c) => handleSelectChildId(c.id)}
                  actionLabel="View Profile"
                  href={`/parent/children/${child.id}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}

