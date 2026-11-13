"use client";

import React, { useEffect, useState } from "react";
import { AppLayout, PageHeader } from "@/components/layout";
import { Button, Icon, Toast } from "@/components/ui";
import {
  FeeModuleNav,
  FeeStats,
  InvoiceForm,
  InvoiceTable,
  RecordPaymentModal,
} from "@/components/fees";
import {
  INITIAL_FEE_INVOICES,
  formatINR,
  getStoredFeeInvoices,
  getStoredFeePayments,
  saveStoredFeeInvoices,
  saveStoredFeePayments,
  type FeeInvoiceRecord,
  type FeePaymentRecord,
} from "@/config/fee-data";

export default function FeeInvoicesPage() {
  const [invoices, setInvoices] =
    useState<FeeInvoiceRecord[]>(INITIAL_FEE_INVOICES);
  const [isInvoiceFormOpen, setIsInvoiceFormOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] =
    useState<FeeInvoiceRecord | null>(null);
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

  function handleSaveInvoice(invoice: FeeInvoiceRecord, isEdit: boolean) {
    setInvoices((prev) => {
      const next = isEdit
        ? prev.map((inv) => (inv.id === invoice.id ? invoice : inv))
        : [invoice, ...prev];
      saveStoredFeeInvoices(next);
      return next;
    });
    setIsInvoiceFormOpen(false);
    setEditingInvoice(null);
    setToast({
      title: isEdit ? "Invoice updated" : "Invoice created",
      description: `${invoice.invoiceId} for ${invoice.studentName} (${formatINR(
        invoice.totalAmount,
      )}) saved.`,
    });
  }

  function handleRecordPayment(
    updatedInvoice: FeeInvoiceRecord,
    newPayment: FeePaymentRecord,
  ) {
    setInvoices((prev) => {
      const next = prev.map((inv) =>
        inv.id === updatedInvoice.id ? updatedInvoice : inv,
      );
      saveStoredFeeInvoices(next);
      return next;
    });
    const currentPayments = getStoredFeePayments();
    saveStoredFeePayments([newPayment, ...currentPayments]);
    setIsRecordPaymentOpen(false);
    setPreselectedInvoice(null);
    setToast({
      title: "Payment recorded",
      description: `Received ${formatINR(newPayment.amountPaid)} for ${updatedInvoice.invoiceId} (${updatedInvoice.studentName}).`,
    });
  }

  return (
    <AppLayout
      breadcrumbs={[
        { label: "School Admin", href: "/dashboard" },
        { label: "Fees", href: "/dashboard/fees" },
        { label: "Invoices" },
      ]}
    >
      <div className="es-stack">
        <PageHeader
          title="Invoices"
          subtitle="Generate, filter, and manage student fee invoices across classes."
          actions={
            <>
              <Button
                variant="secondary"
                size="md"
                leftIcon={<Icon name="indian-rupee" size={15} />}
                onClick={() => {
                  setPreselectedInvoice(null);
                  setIsRecordPaymentOpen(true);
                }}
              >
                Record Payment
              </Button>
              <Button
                variant="primary"
                size="md"
                leftIcon={<Icon name="plus" size={15} />}
                onClick={() => {
                  setEditingInvoice(null);
                  setIsInvoiceFormOpen(true);
                }}
              >
                Create Invoice
              </Button>
            </>
          }
        />

        <FeeModuleNav activeTab="invoices" />

        <FeeStats />

        <InvoiceTable
          invoices={invoices}
          onEditInvoice={(inv) => {
            setEditingInvoice(inv);
            setIsInvoiceFormOpen(true);
          }}
          onRecordPayment={(inv) => {
            setPreselectedInvoice(inv);
            setIsRecordPaymentOpen(true);
          }}
        />
      </div>

      <InvoiceForm
        isOpen={isInvoiceFormOpen}
        onClose={() => {
          setIsInvoiceFormOpen(false);
          setEditingInvoice(null);
        }}
        initialInvoice={editingInvoice}
        onSave={handleSaveInvoice}
      />

      <RecordPaymentModal
        isOpen={isRecordPaymentOpen}
        onClose={() => {
          setIsRecordPaymentOpen(false);
          setPreselectedInvoice(null);
        }}
        invoices={invoices}
        preselectedInvoice={preselectedInvoice}
        onRecordPayment={handleRecordPayment}
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
