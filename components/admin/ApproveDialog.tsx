'use client';

import { useState } from 'react';
import { Button, Modal, Textarea } from '../ui';

/**
 * Approve dialog — an OPTIONAL note.
 *
 * Reject/suspend use the shared `ConfirmDialog` with `requireReason`, which
 * already enforces a non-empty reason. Approve cannot: `requireReason` would
 * make the note mandatory, which is a behaviour change. Hence this small
 * Modal wrapper rather than one dialog trying to be both.
 */
export function ApproveDialog({
  open,
  onOpenChange,
  title,
  subject,
  confirmLabel = 'Approve',
  placeholder = 'Any notes for the applicant…',
  loading,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  subject?: string;
  confirmLabel?: string;
  placeholder?: string;
  loading?: boolean;
  onConfirm: (note?: string) => void | Promise<void>;
}) {
  const [note, setNote] = useState('');

  return (
    <Modal
      open={open}
      onOpenChange={(next) => {
        if (!next) setNote('');
        onOpenChange(next);
      }}
      title={title}
      description={subject}
      footer={
        <>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button loading={loading} onClick={() => onConfirm(note.trim() || undefined)}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <Textarea
        label="Note"
        helper="Optional — shared with the applicant."
        rows={3}
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder={placeholder}
        className="resize-none"
      />
    </Modal>
  );
}
