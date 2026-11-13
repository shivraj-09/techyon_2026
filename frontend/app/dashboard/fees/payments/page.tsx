"use client";

import React, { useEffect, useState } from "react";
import { AppLayout, PageHeader } from "@/components/layout";
import { Button, Icon, Toast } from "@/components/ui";
import {
  FeeModuleNav,
  FeeStats,
  PaymentDetails,
  PaymentHistoryTable,
  RecordPaymentModal,
} from "@/components/fees";
import {
  INITIAL_FEE_INVOICES,
  INITIAL_FEE_PAYMENTS,
  formatINR,
  getStoredFeeInvoices,
  getStoredFeePayments,
  saveStoredFeeInvoices,
  saveStoredFeePayments,
  type FeeInvoiceRecord,
  type FeePaymentRecord,
} from "@/config/fee-data";

export default function FeePaymentHistoryPage() {
  const [invoices, setInvoices] =
    useState<FeeInvoiceRecord[]>(INITIAL_FEE_INVOICES);
  const [payments, setPayments] =
    useState<FeePaymentRecord[]>(INITIAL_FEE_PAYMENTS);
  const [selectedPayment, setSelectedPayment] =
    useState<FeePaymentRecord | null>(null);
  const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState(false);
  const [toast, setToast] = useState<{
    title: string;
    description: string;
  } | null>(null);

  useEffect(() => {
    setInvoices(getStoredFeeInvoices());
    setPayments(getStoredFeePayments());
  }, []);

  return (
    <AppLayout
      breadcrumbs={[
        { label: "School Admin", href: "/dashboard" },
        { label: "Fees", href: "/dashboard/fees" },
        { label: "Payment History" },
      ]}
    >
      <div className="es-stack">
        <PageHeader
          title="Payment History"
          subtitle="Audit recorded fee receipts, payment modes, and transaction references."
          actions={
            <Button
              variant="primary"
              size="md"
              leftIcon={<Icon name="indian-rupee" size={15} />}
              onClick={() => setIsRecordPaymentOpen(true)}
            >
              Record Payment
            </Button>
          }
        />

        <FeeModuleNav activeTab="payments" />

        <FeeStats />

        <PaymentHistoryTable
          payments={payments}
          onSelectPayment={(pay) => setSelectedPayment(pay)}
        />
      </div>

      <RecordPaymentModal
        isOpen={isRecordPaymentOpen}
        onClose={() => setIsRecordPaymentOpen(false)}
        invoices={invoices}
        onRecordPayment={(updatedInv, newPay) => {
          setInvoices((prev) => {
            const next = prev.map((inv) =>
              inv.id === updatedInv.id ? updatedInv : inv,
            );
            saveStoredFeeInvoices(next);
            return next;
          });
          setPayments((prev) => {
            const next = [newPay, ...prev];
            saveStoredFeePayments(next);
            return next;
          });
          setIsRecordPaymentOpen(false);
          setToast({
            title: "Payment recorded",
            description: `Receipt ${newPay.paymentId} (${formatINR(newPay.amountPaid)}) added to payment history.`,
          });
        }}
      />

      <PaymentDetails
        payment={selectedPayment}
        onClose={() => setSelectedPayment(null)}
        onPrintReceipt={(pay) => {
          setSelectedPayment(null);
          setToast({
            title: "Receipt downloaded",
            description: `Receipt ${pay.paymentId} for ${pay.studentName} prepared.`,
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
