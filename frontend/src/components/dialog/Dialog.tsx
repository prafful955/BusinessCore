import React, { useEffect, useRef } from 'react';

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  message: string;
  onYes: () => void;
  onNo: () => void;
  busy?: boolean;
};

export function ConfirmDialog({
  open,
  title,
  message,
  onYes,
  onNo,
  busy = false,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = dialogRef.current;
    if (open && dialog && !dialog.open) dialog.showModal();
    if (!open && dialog?.open) dialog.close();
  }, [open]);

  return (
    <dialog ref={dialogRef} className="dialog" aria-labelledby="confirm-title" aria-describedby="confirm-message" onCancel={e => { e.preventDefault(); if (!busy) onNo(); }}>
        <h3 id="confirm-title">{title}</h3>
        <p id="confirm-message">{message}</p>

        <div>
          <button className="secondary" disabled={busy} onClick={onNo}>
            Cancel
          </button>
          <button disabled={busy} onClick={onYes}>Confirm</button>
        </div>
    </dialog>
  );
}
