"use client";

import React, { useEffect, useState } from "react";
import { AppLayout, PageHeader } from "@/components/layout";
import { Button, Icon, Input, Select, Toast } from "@/components/ui";
import {
  FeeCollectionChart,
  FeeModuleNav,
  FeeStats,
  InvoiceForm,
  InvoiceTable,
  OutstandingBalanceTable,
  PaymentDetails,
  PaymentDistributionChart,
  PaymentHistoryTable,
  RecordPaymentModal,
  type FeeModuleTab,
} from "@/components/fees";
import {
  INITIAL_FEE_INVOICES,
  INITIAL_FEE_PAYMENTS,
  deriveOutstandingBalances,
  formatINR,
  getStoredFeeInvoices,
  getStoredFeePayments,
  saveStoredFeeInvoices,
  saveStoredFeePayments,
  type FeeInvoiceRecord,
  type FeePaymentRecord,
} from "@/config/fee-data";
import { ACADEMIC_YEARS } from "@/config/stage3-data";

/*
 * ============================================================================
 * REFERENCE BACKEND API CONTRACTS (Not called in Stage 5 Frontend Mode)
 * ============================================================================
 * - POST /schools/{school_id}/fees/invoices
 * - GET  /schools/{school_id}/fees/invoices
 * - GET  /schools/{school_id}/fees/balances
 * - POST /schools/{school_id}/fees/invoices/{invoice_id}/payments
 * - GET  /schools/{school_id}/fees/invoices/{invoice_id}/payments
 * ============================================================================
 */

export default function FeeManagementPage() {
  const [activeTab, setActiveTab] = useState<FeeModuleTab>("overview");
  const [academicYear, setAcademicYear] = useState("all");
  const [headerSearch, setHeaderSearch] = useState("");
  const [invoices, setInvoices] =
    useState<FeeInvoiceRecord[]>(INITIAL_FEE_INVOICES);
  const [payments, setPayments] =
    useState<FeePaymentRecord[]>(INITIAL_FEE_PAYMENTS);

  const [isInvoiceFormOpen, setIsInvoiceFormOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] =
    useState<FeeInvoiceRecord | null>(null);
  const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState(false);
  const [preselectedInvoice, setPreselectedInvoice] =
    useState<FeeInvoiceRecord | null>(null);
  const [selectedPaymentDetail, setSelectedPaymentDetail] =
    useState<FeePaymentRecord | null>(null);
  const [toast, setToast] = useState<{
    title: string;
    description: string;
  } | null>(null);

  useEffect(() => {
    setInvoices(getStoredFeeInvoices());
    setPayments(getStoredFeePayments());
  }, []);

  const balances = deriveOutstandingBalances(invoices);

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
    setPayments((prev) => {
      const next = [newPayment, ...prev];
      saveStoredFeePayments(next);
      return next;
    });
    setIsRecordPaymentOpen(false);
    setPreselectedInvoice(null);
    setToast({
      title: "Payment recorded",
      description: `Received ${formatINR(newPayment.amountPaid)} for ${updatedInvoice.invoiceId} (${updatedInvoice.studentName}). Status: ${updatedInvoice.status}.`,
    });
  }

  return (
    <AppLayout
      breadcrumbs={[
        { label: "School Admin", href: "/dashboard" },
        { label: "Fees" },
      ]}
    >
      <div className="es-stack">
        {/* Page Header */}
        <PageHeader
          title="Fee Management"
          subtitle="Manage invoices, track collections and monitor outstanding payments."
          actions={
            <>
              <Select
                aria-label="Academic Year"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                options={[
                  { value: "all", label: "All Academic Years" },
                  ...ACADEMIC_YEARS.map((yr) => ({
                    value: yr,
                    label: `AY ${yr}`,
                  })),
                ]}
                style={{ width: "165px" }}
              />

              <div style={{ width: "210px" }}>
                <Input
                  placeholder="Search invoices, students..."
                  value={headerSearch}
                  onChange={(e) => setHeaderSearch(e.target.value)}
                />
              </div>

              <Button
                variant="secondary"
                size="md"
                leftIcon={<Icon name="filter" size={15} />}
                onClick={() => setActiveTab("invoices")}
              >
                Filter
              </Button>

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

        {/* Secondary Module Navigation */}
        <FeeModuleNav activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Four Primary Fee Statistics Cards */}
        <FeeStats />

        {/* Tab 1: Overview */}
        {activeTab === "overview" && (
          <div className="es-stack">
            {/* Fee Collection Analytics & Payment Distribution */}
            <section
              className="es-dashboard-grid-main"
              aria-label="Fee Collection Analytics"
            >
              <FeeCollectionChart />
              <PaymentDistributionChart />
            </section>

            {/* Invoice Listing Section */}
            <InvoiceTable
              invoices={invoices}
              externalSearch={headerSearch}
              externalAcademicYear={academicYear}
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
        )}

        {/* Tab 2: Invoices */}
        {activeTab === "invoices" && (
          <InvoiceTable
            invoices={invoices}
            externalSearch={headerSearch}
            externalAcademicYear={academicYear}
            onEditInvoice={(inv) => {
              setEditingInvoice(inv);
              setIsInvoiceFormOpen(true);
            }}
            onRecordPayment={(inv) => {
              setPreselectedInvoice(inv);
              setIsRecordPaymentOpen(true);
            }}
          />
        )}

        {/* Tab 3: Outstanding Balances */}
        {activeTab === "balances" && (
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
        )}

        {/* Tab 4: Payment History */}
        {activeTab === "payments" && (
          <PaymentHistoryTable
            payments={payments}
            onSelectPayment={(pay) => setSelectedPaymentDetail(pay)}
          />
        )}
      </div>

      {/* Create / Edit Invoice Modal */}
      <InvoiceForm
        isOpen={isInvoiceFormOpen}
        onClose={() => {
          setIsInvoiceFormOpen(false);
          setEditingInvoice(null);
        }}
        initialInvoice={editingInvoice}
        onSave={handleSaveInvoice}
      />

      {/* Record Payment Modal */}
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

      {/* Payment Receipt Details Modal */}
      <PaymentDetails
        payment={selectedPaymentDetail}
        onClose={() => setSelectedPaymentDetail(null)}
        onPrintReceipt={(pay) => {
          setSelectedPaymentDetail(null);
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
