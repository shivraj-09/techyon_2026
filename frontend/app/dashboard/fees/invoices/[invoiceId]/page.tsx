"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AppLayout } from "@/components/layout";
import { Button, Card, CardBody, EmptyState, Toast } from "@/components/ui";
import {
  InvoiceDetails,
  InvoiceForm,
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

export default function InvoiceDetailsPage() {
  const params = useParams<{ invoiceId: string }>();
  const invoiceSlug = params?.invoiceId || "";

  const [invoices, setInvoices] =
    useState<FeeInvoiceRecord[]>(INITIAL_FEE_INVOICES);
  const [payments, setPayments] =
    useState<FeePaymentRecord[]>(INITIAL_FEE_PAYMENTS);
  const [isEditing, setIsEditing] = useState(false);
  const [isRecordingPayment, setIsRecordingPayment] = useState(false);
  const [toast, setToast] = useState<{
    title: string;
    description: string;
  } | null>(null);

  useEffect(() => {
    setInvoices(getStoredFeeInvoices());
    setPayments(getStoredFeePayments());
  }, []);

  const invoice =
    invoices.find(
      (inv) =>
        inv.id.toLowerCase() === invoiceSlug.toLowerCase() ||
        inv.invoiceId.toLowerCase() === invoiceSlug.toLowerCase(),
    ) || null;

  if (!invoice) {
    return (
      <AppLayout>
        <Card>
          <CardBody>
            <EmptyState
              icon="file-text"
              title="Invoice not found"
              description={`No fee invoice matching "${invoiceSlug}" was found.`}
              action={
                <Link href="/dashboard/fees/invoices">
                  <Button variant="primary">Back to Invoices</Button>
                </Link>
              }
            />
          </CardBody>
        </Card>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      breadcrumbs={[
        { label: "School Admin", href: "/dashboard" },
        { label: "Fees", href: "/dashboard/fees" },
        { label: "Invoices", href: "/dashboard/fees/invoices" },
        { label: invoice.invoiceId },
      ]}
    >
      <InvoiceDetails
        invoice={invoice}
        payments={payments.filter((p) => p.invoiceId === invoice.invoiceId)}
        onRecordPayment={() => setIsRecordingPayment(true)}
        onEditInvoice={() => setIsEditing(true)}
        onPrintInvoice={() =>
          setToast({
            title: "Print preview prepared",
            description: `Formatted printable statement for ${invoice.invoiceId}.`,
          })
        }
        onDownloadInvoice={() =>
          setToast({
            title: "Invoice PDF downloaded",
            description: `Downloaded ${invoice.invoiceId}_${invoice.studentCode}.pdf.`,
          })
        }
      />

      <InvoiceForm
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        initialInvoice={invoice}
        onSave={(updated) => {
          setInvoices((prev) => {
            const next = prev.map((inv) =>
              inv.id === updated.id ? updated : inv,
            );
            saveStoredFeeInvoices(next);
            return next;
          });
          setIsEditing(false);
          setToast({
            title: "Invoice updated",
            description: `Saved changes to ${updated.invoiceId}.`,
          });
        }}
      />

      <RecordPaymentModal
        isOpen={isRecordingPayment}
        onClose={() => setIsRecordingPayment(false)}
        invoices={invoices}
        preselectedInvoice={invoice}
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
          setIsRecordingPayment(false);
          setToast({
            title: "Payment recorded",
            description: `Recorded ${formatINR(newPay.amountPaid)} against ${updatedInv.invoiceId}. Remaining balance: ${formatINR(updatedInv.balanceAmount)}.`,
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
