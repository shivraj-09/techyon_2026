"use client";

import React, { useEffect, useState } from "react";
import { Button, Input, Modal, Select } from "@/components/ui";
import {
  PAYMENT_METHODS,
  computeInvoiceStatus,
  formatINR,
  type FeeInvoiceRecord,
  type FeePaymentRecord,
  type PaymentMethod,
} from "@/config/fee-data";

export interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoices: FeeInvoiceRecord[];
  preselectedInvoice?: FeeInvoiceRecord | null;
  onRecordPayment: (
    updatedInvoice: FeeInvoiceRecord,
    newPayment: FeePaymentRecord,
  ) => void;
}

export function RecordPaymentModal({
  isOpen,
  onClose,
  invoices,
  preselectedInvoice,
  onRecordPayment,
}: RecordPaymentModalProps) {
  const unpaidInvoices = invoices.filter((inv) => inv.balanceAmount > 0);
  const availableList =
    unpaidInvoices.length > 0 ? unpaidInvoices : invoices;

  const [selectedInvoiceId, setSelectedInvoiceId] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState("2026-11-14");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("UPI");
  const [transactionRef, setTransactionRef] = useState("");
  const [remarks, setRemarks] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    const target =
      preselectedInvoice || unpaidInvoices[0] || invoices[0] || null;
    if (target) {
      setSelectedInvoiceId(target.id);
      setPaymentAmount(String(target.balanceAmount || ""));
    }
    setPaymentDate("2026-11-14");
    setPaymentMethod("UPI");
    setTransactionRef("");
    setRemarks("");
    setError("");
  }, [isOpen, preselectedInvoice]);

  const currentInvoice =
    invoices.find((inv) => inv.id === selectedInvoiceId) ||
    preselectedInvoice ||
    availableList[0];

  const totalInvoiceAmount = currentInvoice?.totalAmount || 0;
  const previouslyPaidAmount = currentInvoice?.paidAmount || 0;
  const currentBalance = currentInvoice?.balanceAmount || 0;

  const numericNewPayment = Number(paymentAmount) || 0;
  const remainingBalance = Math.max(0, currentBalance - numericNewPayment);

  function handleInvoiceSelect(nextId: string) {
    setSelectedInvoiceId(nextId);
    const found = invoices.find((inv) => inv.id === nextId);
    if (found) {
      setPaymentAmount(String(found.balanceAmount));
    }
    setError("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!currentInvoice) {
      setError("Please select an invoice.");
      return;
    }
    if (!paymentAmount || isNaN(Number(paymentAmount))) {
      setError("Please enter a valid payment amount.");
      return;
    }
    if (numericNewPayment <= 0) {
      setError("Payment amount must be greater than ₹0.");
      return;
    }
    if (numericNewPayment > currentBalance) {
      setError(
        `Payment amount cannot exceed the remaining balance of ${formatINR(currentBalance)}.`,
      );
      return;
    }
    if (!paymentDate) {
      setError("Payment date is required.");
      return;
    }

    const updatedPaid = previouslyPaidAmount + numericNewPayment;
    const updatedBalance = Math.max(0, totalInvoiceAmount - updatedPaid);
    const updatedStatus = computeInvoiceStatus(
      totalInvoiceAmount,
      updatedPaid,
      currentInvoice.dueDate,
    );

    const updatedInvoice: FeeInvoiceRecord = {
      ...currentInvoice,
      paidAmount: updatedPaid,
      balanceAmount: updatedBalance,
      status: updatedStatus,
    };

    const newPayment: FeePaymentRecord = {
      id: `pay-${Date.now()}`,
      paymentId: `PAY-2026-${Math.floor(500 + Math.random() * 499)}`,
      invoiceId: currentInvoice.invoiceId,
      studentId: currentInvoice.studentId,
      studentCode: currentInvoice.studentCode,
      studentName: currentInvoice.studentName,
      className: currentInvoice.className,
      amountPaid: numericNewPayment,
      paymentDate,
      paymentMethod,
      transactionRef:
        transactionRef.trim() ||
        (paymentMethod === "Cash"
          ? "CASH-COUNTER-01"
          : `TXN-${Math.floor(100000 + Math.random() * 899999)}`),
      remarks: remarks.trim() || undefined,
      recordedBy: "Arjun Mehta (School Admin)",
    };

    onRecordPayment(updatedInvoice, newPayment);
    onClose();
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Fee Payment"
      description="Log a full or partial fee payment against a student invoice."
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            Confirm & Record Payment
          </Button>
        </>
      }
    >
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "14px" }}
      >
        <Select
          label="Select Invoice *"
          value={currentInvoice?.id || ""}
          onChange={(e) => handleInvoiceSelect(e.target.value)}
          options={availableList.map((inv) => ({
            value: inv.id,
            label: `${inv.invoiceId} — ${inv.studentName} (${inv.className}) · Bal: ${formatINR(inv.balanceAmount)}`,
          }))}
        />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "10px",
          }}
        >
          <Input
            label="Student Name"
            value={currentInvoice?.studentName || ""}
            readOnly
            disabled
          />
          <Input
            label="Invoice ID"
            value={currentInvoice?.invoiceId || ""}
            readOnly
            disabled
          />
        </div>

        {/* Live Calculation Summary Box */}
        <div
          style={{
            padding: "12px 14px",
            backgroundColor: "var(--es-bg-app)",
            border: "1px solid var(--es-border)",
            borderRadius: "var(--es-radius-md)",
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "10px",
          }}
        >
          <div>
            <div style={{ fontSize: "11px", color: "var(--es-text-muted)" }}>
              Total Invoice
            </div>
            <div style={{ fontSize: "14px", fontWeight: 700, marginTop: "2px" }}>
              {formatINR(totalInvoiceAmount)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: "11px", color: "var(--es-text-muted)" }}>
              Previously Paid
            </div>
            <div
              style={{
                fontSize: "14px",
                fontWeight: 700,
                color: "var(--es-success)",
                marginTop: "2px",
              }}
            >
              {formatINR(previouslyPaidAmount)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: "11px", color: "var(--es-text-muted)" }}>
              Remaining Balance
            </div>
            <div
              style={{
                fontSize: "14px",
                fontWeight: 700,
                color:
                  remainingBalance === 0
                    ? "var(--es-success)"
                    : "var(--es-primary)",
                marginTop: "2px",
              }}
            >
              {formatINR(remainingBalance)}
            </div>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "12px",
          }}
        >
          <Input
            type="number"
            min="1"
            max={currentBalance}
            label={`Payment Amount (Max ${formatINR(currentBalance)}) *`}
            value={paymentAmount}
            onChange={(e) => {
              setPaymentAmount(e.target.value);
              setError("");
            }}
          />

          <Input
            type="date"
            label="Payment Date *"
            value={paymentDate}
            onChange={(e) => setPaymentDate(e.target.value)}
          />

          <Select
            label="Payment Method *"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
            options={PAYMENT_METHODS.map((m) => ({ value: m, label: m }))}
          />

          <Input
            label="Transaction Reference (Optional)"
            placeholder="e.g. UPI-43298104"
            value={transactionRef}
            onChange={(e) => setTransactionRef(e.target.value)}
          />
        </div>

        <Input
          label="Remarks (Optional)"
          placeholder="Optional payment note or installment reference..."
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
        />

        {error && (
          <div
            style={{
              padding: "10px 12px",
              backgroundColor: "var(--es-danger-bg)",
              border: "1px solid var(--es-danger-border)",
              borderRadius: "var(--es-radius-sm)",
              fontSize: "12.5px",
              color: "var(--es-danger)",
              fontWeight: 500,
            }}
          >
            {error}
          </div>
        )}
      </form>
    </Modal>
  );
}
