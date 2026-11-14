"use client";

import React, { useEffect, useState } from "react";
import { Button, Icon, Input, Modal, Select } from "@/components/ui";
import {
  NOTICE_AUDIENCES,
  NOTICE_CATEGORIES,
  type CounsellingNoticeRecord,
  type NoticeAudience,
  type NoticeCategory,
  type NoticeStatus,
} from "@/config/counsellor-data";
import type { SaveNoticeInput } from "@/config/counsellor-store";

export interface NoticeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingNotice?: CounsellingNoticeRecord | null;
  onSave: (input: SaveNoticeInput) => void;
}

export function NoticeFormModal({
  isOpen,
  onClose,
  editingNotice,
  onSave,
}: NoticeFormModalProps) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<NoticeCategory>("Wellbeing");
  const [audience, setAudience] = useState<NoticeAudience>("Students");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [publishedDate, setPublishedDate] = useState("2026-11-14");
  const [expiryDate, setExpiryDate] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    if (editingNotice) {
      setTitle(editingNotice.title);
      setCategory(editingNotice.category);
      setAudience(editingNotice.audience);
      setSummary(editingNotice.summary);
      setContent(editingNotice.content);
      setPublishedDate(editingNotice.publishedDate);
      setExpiryDate(editingNotice.expiryDate ?? "");
    } else {
      setTitle("");
      setCategory("Wellbeing");
      setAudience("Students");
      setSummary("");
      setContent("");
      setPublishedDate("2026-11-14");
      setExpiryDate("");
    }
    setError("");
  }, [isOpen, editingNotice]);

  function submitWithStatus(status: NoticeStatus) {
    if (!title.trim() || title.trim().length < 5) {
      setError("Notice title must be at least 5 characters.");
      return;
    }
    if (!summary.trim()) {
      setError("Please provide a short notice summary.");
      return;
    }
    if (!content.trim() || content.trim().length < 15) {
      setError("Notice body must be at least 15 characters.");
      return;
    }
    if (expiryDate && publishedDate && expiryDate < publishedDate) {
      setError("Expiry date cannot be earlier than the publish date.");
      return;
    }

    onSave({
      id: editingNotice?.id,
      title: title.trim(),
      category,
      audience,
      summary: summary.trim(),
      content: content.trim(),
      publishedDate: publishedDate || "2026-11-14",
      expiryDate: expiryDate || undefined,
      status,
    });
    onClose();
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingNotice ? "Edit Wellbeing Notice" : "Create Wellbeing Notice"}
      description="Publish school wellbeing announcements, drop-in hours, or support workshops."
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="secondary"
            onClick={() => submitWithStatus("Draft")}
          >
            Save as Draft
          </Button>
          <Button
            onClick={() => submitWithStatus("Published")}
            leftIcon={<Icon name="send" size={14} />}
          >
            Publish Notice
          </Button>
        </>
      }
    >
      <div className="es-stack" style={{ gap: "0.875rem" }}>
        <Input
          id="notice-title"
          label="Notice Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Exam Stress Support & Study Balance Workshop"
        />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))",
            gap: "0.75rem",
          }}
        >
          <Select
            id="notice-category"
            label="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value as NoticeCategory)}
            options={NOTICE_CATEGORIES.map((c) => ({ value: c, label: c }))}
          />
          <Select
            id="notice-audience"
            label="Target Audience"
            value={audience}
            onChange={(e) => setAudience(e.target.value as NoticeAudience)}
            options={NOTICE_AUDIENCES.map((a) => ({ value: a, label: a }))}
          />
        </div>

        <Input
          id="notice-summary"
          label="Short Summary"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="One-line overview shown in notice cards"
        />

        <label className="es-field" htmlFor="notice-content">
          <span className="es-label">Full Notice Message</span>
          <textarea
            id="notice-content"
            className="es-input"
            rows={5}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write supportive, clear details including timing, location, and how students or families can reach out..."
            style={{ height: "auto", padding: "0.625rem 0.75rem", resize: "vertical" }}
          />
        </label>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 180px), 1fr))",
            gap: "0.75rem",
          }}
        >
          <Input
            id="notice-pub-date"
            label="Publish Date"
            type="date"
            value={publishedDate}
            onChange={(e) => setPublishedDate(e.target.value)}
          />
          <Input
            id="notice-expiry-date"
            label="Expiry Date (Optional)"
            type="date"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
          />
        </div>

        {error && (
          <p
            style={{
              margin: 0,
              fontSize: "0.8125rem",
              color: "var(--es-danger-text)",
            }}
          >
            {error}
          </p>
        )}
      </div>
    </Modal>
  );
}

