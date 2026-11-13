"use client";

import React, { useEffect, useState } from "react";
import { AppLayout, PageHeader } from "@/components/layout";
import { Button, Icon, Toast } from "@/components/ui";
import {
  FeeModuleNav,
  FeeStats,
  OutstandingBalanceTable,
  RecordPaymentModal,
} from "@/components/fees";
import {
  INITIAL_FEE_INVOICES,
  deriveOutstandingBalances,
  formatINR,
  getStoredFeeInvoices,
  getStoredFeePayments,
  saveStoredFeeInvoices,
  saveStoredFeePayments,
  type FeeInvoiceRecord,
} from "@/config/fee-data";

export default function OutstandingBalancesPage() {
  const [invoices, setInvoices] =
    useState<FeeInvoiceRecord[]>(INITIAL_FEE_INVOICES);
  const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState(false);
  const [preselectedInvoice, setPreselectedInvoice] =
    useState<FeeInvoiceRecord | null>(null);
  const [toast, setToast] = useState<{
    title: string;
    description: string;
  } | null>(null);

  useEffect(() => {
    setInvoices(getStoredFeeInvoices());
  }, []);

  const balances = deriveOutstandingBalances(invoices);

  return (
    <AppLayout
      breadcrumbs={[
        { label: "School Admin", href: "/dashboard" },
        { label: "Fees", href: "/dashboard/fees" },
        { label: "Outstanding Balances" },
      ]}
    >
      <div className="es-stack">
        <PageHeader
          title="Outstanding Balances"
          subtitle="Monitor students with pending or overdue fee balances and record installment payments."
          actions={
            <Button
              variant="primary"
              size="md"
              leftIcon={<Icon name="indian-rupee" size={15} />}
              onClick={() => {
                setPreselectedInvoice(null);
                setIsRecordPaymentOpen(true);
              }}
            >
              Record Payment
            </Button>
          }
        />

        <FeeModuleNav activeTab="balances" />

        <FeeStats />

        <OutstandingBalanceTable
          balances={balances}
          onRecordPaymentForInvoiceId={(invoiceId) => {
            const target =
              invoices.find(
                (inv) => inv.id === invoiceId || inv.invoiceId === invoiceId,
              ) || null;
            setPreselectedInvoice(target);
            setIsRecordPaymentOpen(true);
          }}
        />
      </div>

      <RecordPaymentModal
        isOpen={isRecordPaymentOpen}
        onClose={() => {
          setIsRecordPaymentOpen(false);
          setPreselectedInvoice(null);
        }}
        invoices={invoices}
        preselectedInvoice={preselectedInvoice}
        onRecordPayment={(updatedInv, newPay) => {
          setInvoices((prev) => {
            const next = prev.map((inv) =>
              inv.id === updatedInv.id ? updatedInv : inv,
            );
            saveStoredFeeInvoices(next);
            return next;
          });
          const currentPayments = getStoredFeePayments();
          saveStoredFeePayments([newPay, ...currentPayments]);
          setIsRecordPaymentOpen(false);
          setPreselectedInvoice(null);
          setToast({
            title: "Payment recorded",
            description: `Received ${formatINR(newPay.amountPaid)} for ${updatedInv.studentName} (${updatedInv.invoiceId}).`,
          });
        }}
      />

      {toast && (
        <div className="es-toast-region">
          <Toast
            variant="success"
            title={toast.title}
            description={toast.description}
            onDismiss={() => setToast(null)}
          />
        </div>
      )}
    </AppLayout>
  );
}
