import React from "react";
import { Badge, type BadgeVariant } from "@/components/ui";
import type { FeeInvoiceStatus } from "@/config/fee-data";

export interface FeeStatusBadgeProps {
  status: FeeInvoiceStatus;
}

export function FeeStatusBadge({ status }: FeeStatusBadgeProps) {
  let variant: BadgeVariant = "neutral";
  if (status === "Paid") variant = "success";
  else if (status === "Partial") variant = "primary";
  else if (status === "Pending") variant = "warning";
  else if (status === "Overdue") variant = "danger";

  return (
    <Badge variant={variant} dot>
      {status}
    </Badge>
  );
}
