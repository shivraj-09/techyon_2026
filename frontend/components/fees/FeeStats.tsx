import React from "react";
import { Icon, type IconName } from "@/components/ui";
import { FEE_OVERVIEW_STATS, formatINR } from "@/config/fee-data";

export interface FeeStatsProps {
  totalFees?: number;
  collectedFees?: number;
  collectedPercentage?: string;
  outstandingFees?: number;
  overdueFees?: number;
  overdueInvoicesCount?: number;
}

export function FeeStats({
  totalFees = FEE_OVERVIEW_STATS.totalFees,
  collectedFees = FEE_OVERVIEW_STATS.collectedFees,
  collectedPercentage = FEE_OVERVIEW_STATS.collectedPercentage,
  outstandingFees = FEE_OVERVIEW_STATS.outstandingFees,
  overdueFees = FEE_OVERVIEW_STATS.overdueFees,
  overdueInvoicesCount = FEE_OVERVIEW_STATS.overdueInvoicesCount,
}: FeeStatsProps) {
  const cards: {
    id: string;
    title: string;
    value: string;
    subtitle: string;
    icon: IconName;
    iconBg: string;
    iconColor: string;
    iconBorder: string;
    subColor: string;
  }[] = [
    {
      id: "total-fees",
      title: "Total Fees",
      value: formatINR(totalFees),
      subtitle: "Total fees generated",
      icon: "indian-rupee",
      iconBg: "var(--es-primary-subtle)",
      iconColor: "var(--es-primary)",
      iconBorder: "var(--es-primary-border)",
      subColor: "var(--es-text-muted)",
    },
    {
      id: "collected-fees",
      title: "Collected",
      value: formatINR(collectedFees),
      subtitle: `${collectedPercentage} collected`,
      icon: "wallet",
      iconBg: "var(--es-success-bg)",
      iconColor: "var(--es-success)",
      iconBorder: "var(--es-success-border)",
      subColor: "var(--es-success)",
    },
    {
      id: "outstanding-fees",
      title: "Outstanding",
      value: formatINR(outstandingFees),
      subtitle: "Remaining balance",
      icon: "credit-card",
      iconBg: "var(--es-warning-bg)",
      iconColor: "var(--es-warning)",
      iconBorder: "var(--es-warning-border)",
      subColor: "var(--es-warning)",
    },
    {
      id: "overdue-fees",
      title: "Overdue",
      value: formatINR(overdueFees),
      subtitle: `${overdueInvoicesCount} overdue invoices`,
      icon: "alert-triangle",
      iconBg: "var(--es-danger-bg)",
      iconColor: "var(--es-danger)",
      iconBorder: "var(--es-danger-border)",
      subColor: "var(--es-danger)",
    },
  ];

  return (
    <section className="es-grid-4" aria-label="Fee Overview Statistics">
      {cards.map((card) => (
        <article key={card.id} className="es-stat-card">
          <div className="es-stat-top">
            <span
              style={{
                fontWeight: 600,
                color: "var(--es-text-secondary)",
                fontSize: "13px",
              }}
            >
              {card.title}
            </span>
            <span
              style={{
                width: 34,
                height: 34,
                borderRadius: "var(--es-radius-md)",
                backgroundColor: card.iconBg,
                color: card.iconColor,
                border: `1px solid ${card.iconBorder}`,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Icon name={card.icon} size={17} />
            </span>
          </div>

          <div className="es-stat-value">{card.value}</div>

          <div
            style={{
              fontSize: "12.5px",
              fontWeight: 500,
              color: card.subColor,
              marginTop: "2px",
            }}
          >
            {card.subtitle}
          </div>
        </article>
      ))}
    </section>
  );
}
