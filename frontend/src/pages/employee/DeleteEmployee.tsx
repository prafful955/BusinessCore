import React, { useState } from 'react';
import { ConfirmDialog } from '../../components/dialog/Dialog';
import { employeeApi } from './employee.api';
import type { Employee } from './employee.types';

export function DeleteEmployee({
  employee,
  onDeleted,
  onClose,
}: {
  employee: Employee;
  onDeleted: () => void;
  onClose: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [zErrorL, setError] = useState('');
  async function remove() {
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      await employeeApi.delete(employee.id);
      onDeleted();
    } catch (oErrorP) {
      setError(oErrorP instanceof Error ? oErrorP.message : 'Unable to delete employee.');
    } finally {
      setBusy(false);
    }
  }

  return React.createElement(ConfirmDialog, {
    open: true,
    title: 'Delete employee?',
    message:
      zErrorL ||
      (busy ? 'Deleting employee...' : `Delete ${employee.name}? This action cannot be undone.`),
    onNo: () => {
      if (!busy) onClose();
    },
    onYes: remove,
    busy,
  });
}
