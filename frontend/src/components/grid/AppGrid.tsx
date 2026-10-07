import { UiIcon } from '../../layouts/AppLayout';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export type GridColumn<T> = { key: keyof T; label: string; render?: (row: T) => React.ReactNode };
type Props<T> = {
  gridId: string;
  title: string;
  rowLabel?: string;
  rows: T[];
  columns: GridColumn<T>[];
  selectedId?: number;
  onSelect: (row: T) => void;
  onView: (row: T) => void;
  onUpdate: (row: T) => void;
  onDelete?: (row: T) => void;
  actionsDisabled?: boolean;
  emptyMessage?: string;
};
export function AppGrid<T extends { id: number }>({
  gridId,
  title,
  rowLabel = 'records',
  rows,
  columns,
  selectedId,
  onSelect,
  onView,
  onUpdate,
  onDelete,
  actionsDisabled = false,
  emptyMessage,
}: Props<T>) {
  const [oMenuL, setMenu] = useState<{
    id: number;
    x: number;
    y: number;
    trigger: HTMLButtonElement;
  } | null>(null);
  const oMenuRefL = useRef<HTMLDivElement>(null);
  const [nPageL, setPage] = useState(1);
  const [nPageSizeL, setPageSize] = useState(10);
  const [zSortKeyL, setSortKey] = useState<keyof T>();
  const [bDescendingL, setDescending] = useState(false);
  const [aHiddenL, setHidden] = useState<string[]>([]);
  const aColumnsL = columns.filter((oColumnP) => !aHiddenL.includes(String(oColumnP.key)));
  const aSortedL = zSortKeyL
    ? [...rows].sort(
        (oFirstP, oSecondP) =>
          String(oFirstP[zSortKeyL] ?? '').localeCompare(
            String(oSecondP[zSortKeyL] ?? ''),
            undefined,
            { numeric: true, sensitivity: 'base' }
          ) * (bDescendingL ? -1 : 1)
      )
    : rows;
  const nPagesL = Math.max(1, Math.ceil(rows.length / nPageSizeL));
  const nCurrentL = Math.min(nPageL, nPagesL);
  const aPageRowsL = aSortedL.slice((nCurrentL - 1) * nPageSizeL, nCurrentL * nPageSizeL);
  const zRowIdsL = rows.map((oRowP) => oRowP.id).join(',');
  useEffect(() => {
    setPage(1);
    setMenu(null);
  }, [zRowIdsL, nPageSizeL, zSortKeyL, bDescendingL]);
  function exportCsv() {
    function cell(oValueP: unknown) {
      let zValueL = String(oValueP ?? '');
      if (/^[=+@\-\t\r]/.test(zValueL)) zValueL = "'" + zValueL;
      return '"' + zValueL.replace(/"/g, '""') + '"';
    }
    const zCsvL = [
      aColumnsL.map((oColumnP) => cell(oColumnP.label)).join(','),
      ...aSortedL.map((oRowP) => aColumnsL.map((oColumnP) => cell(oRowP[oColumnP.key])).join(',')),
    ].join('\r\n');
    const zUrlL = URL.createObjectURL(
      new Blob(['\uFEFF' + zCsvL], { type: 'text/csv;charset=utf-8' })
    );
    const oLinkL = document.createElement('a');
    oLinkL.href = zUrlL;
    oLinkL.download = gridId + '.csv';
    oLinkL.click();
    setTimeout(() => URL.revokeObjectURL(zUrlL), 1000);
  }
  const oRowL = rows.find((oRowP) => oRowP.id === oMenuL?.id);
  function closeMenu(bRestoreP = false) {
    if (bRestoreP) oMenuL?.trigger.focus();
    setMenu(null);
  }
  useLayoutEffect(() => {
    if (!oMenuL || !oMenuRefL.current) return;
    const oElementL = oMenuRefL.current;
    const oBoundsL = oElementL.getBoundingClientRect();
    oElementL.style.left = `${Math.max(8, Math.min(oMenuL.x, window.innerWidth - oBoundsL.width - 8))}px`;
    oElementL.style.top = `${Math.max(8, Math.min(oMenuL.y, window.innerHeight - oBoundsL.height - 8))}px`;
    oElementL.querySelector<HTMLButtonElement>('button')?.focus();
  }, [oMenuL]);
  useEffect(() => {
    if (!oMenuL) return;
    function dismiss(oEventP: Event) {
      if (
        oEventP.type === 'pointerdown' &&
        (oMenuRefL.current?.contains(oEventP.target as Node) ||
          oMenuL?.trigger.contains(oEventP.target as Node))
      )
        return;
      setMenu(null);
    }
    document.addEventListener('pointerdown', dismiss);
    window.addEventListener('resize', dismiss);
    document.addEventListener('scroll', dismiss, true);
    return () => {
      document.removeEventListener('pointerdown', dismiss);
      window.removeEventListener('resize', dismiss);
      document.removeEventListener('scroll', dismiss, true);
    };
  }, [oMenuL]);
  useEffect(() => {
    if (!oRowL || actionsDisabled) setMenu(null);
  }, [oRowL, actionsDisabled]);
  return (
    <section className="grid-card" aria-label={title} id={gridId}>
      <div className="grid-head">
        <h2>{title}</h2>
        <span>
          {rows.length} {rowLabel}
        </span>
        <div className="grid-tools">
          <button type="button" className="secondary" disabled={!rows.length} onClick={exportCsv}>
            Export CSV
          </button>
          <details className="column-picker">
            <summary>Columns</summary>
            <div className="column-picker-panel">
              {columns.map((oColumnP) => (
                <label key={String(oColumnP.key)}>
                  <input
                    type="checkbox"
                    checked={!aHiddenL.includes(String(oColumnP.key))}
                    disabled={aColumnsL.length === 1 && !aHiddenL.includes(String(oColumnP.key))}
                    onChange={(oEventP) =>
                      setHidden(
                        oEventP.target.checked
                          ? aHiddenL.filter((zKeyP) => zKeyP !== String(oColumnP.key))
                          : [...aHiddenL, String(oColumnP.key)]
                      )
                    }
                  />
                  {oColumnP.label}
                </label>
              ))}
            </div>
          </details>
        </div>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Select</th>
              {aColumnsL.map((oColumnP) => (
                <th
                  key={String(oColumnP.key)}
                  aria-sort={
                    zSortKeyL === oColumnP.key
                      ? bDescendingL
                        ? 'descending'
                        : 'ascending'
                      : 'none'
                  }
                >
                  <button
                    type="button"
                    className="sort-column"
                    onClick={() => {
                      setSortKey(oColumnP.key);
                      setDescending(zSortKeyL === oColumnP.key ? !bDescendingL : false);
                    }}
                  >
                    {oColumnP.label}
                    <span aria-hidden="true">
                      {zSortKeyL === oColumnP.key ? (bDescendingL ? '↓' : '↑') : '↕'}
                    </span>
                  </button>
                </th>
              ))}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {aPageRowsL.map((oRowP) => (
              <tr
                key={oRowP.id}
                className={selectedId === oRowP.id ? 'selected' : ''}
                onContextMenu={(oEventP) => {
                  if (actionsDisabled) return;
                  oEventP.preventDefault();
                  const oTriggerL =
                    oEventP.currentTarget.querySelector<HTMLButtonElement>('[data-row-actions]');
                  if (!oTriggerL) return;
                  onSelect(oRowP);
                  setMenu({
                    id: oRowP.id,
                    x: oEventP.clientX,
                    y: oEventP.clientY,
                    trigger: oTriggerL,
                  });
                }}
              >
                <td>
                  <input
                    type="radio"
                    name={`${gridId}-selection`}
                    aria-label={`Select ${rowLabel} ${oRowP.id}`}
                    checked={selectedId === oRowP.id}
                    onChange={() => onSelect(oRowP)}
                  />
                </td>
                {aColumnsL.map((oColumnP) => (
                  <td key={String(oColumnP.key)}>
                    {oColumnP.render ? (
                      oColumnP.render(oRowP)
                    ) : String(oColumnP.key) === 'status' ? (
                      <span
                        className={`record-status ${String(oRowP[oColumnP.key]).toLowerCase().replace(/\s+/g, '-')}`}
                      >
                        {String(oRowP[oColumnP.key])}
                      </span>
                    ) : (
                      String(oRowP[oColumnP.key] ?? '')
                    )}
                  </td>
                ))}
                <td>
                  <div className="row-actions">
                    <button
                      type="button"
                      className="row-icon"
                      disabled={actionsDisabled}
                      aria-label={`Update ${rowLabel} ${oRowP.id}`}
                      title="Update"
                      onClick={() => {
                        onSelect(oRowP);
                        onUpdate(oRowP);
                      }}
                    >
                      <UiIcon name="edit" />
                    </button>
                    <button
                      type="button"
                      className="row-icon view"
                      disabled={actionsDisabled}
                      aria-label={`View ${rowLabel} ${oRowP.id}`}
                      title="View"
                      onClick={() => {
                        onSelect(oRowP);
                        onView(oRowP);
                      }}
                    >
                      <UiIcon name="view" />
                    </button>
                    {onDelete && (
                      <button
                        type="button"
                        className="row-icon danger"
                        disabled={actionsDisabled}
                        aria-label={`Delete ${rowLabel} ${oRowP.id}`}
                        title="Delete"
                        onClick={() => {
                          onSelect(oRowP);
                          onDelete(oRowP);
                        }}
                      >
                        <UiIcon name="delete" />
                      </button>
                    )}
                    <button
                      type="button"
                      className="secondary"
                      data-row-actions
                      disabled={actionsDisabled}
                      aria-label={`Actions for ${rowLabel} ${oRowP.id}`}
                      aria-haspopup="menu"
                      aria-expanded={oMenuL?.id === oRowP.id}
                      aria-controls={oMenuL?.id === oRowP.id ? `${gridId}-menu` : undefined}
                      onClick={(oEventP) => {
                        if (oMenuL?.id === oRowP.id) {
                          closeMenu(true);
                          return;
                        }
                        const oBoundsL = oEventP.currentTarget.getBoundingClientRect();
                        onSelect(oRowP);
                        setMenu({
                          id: oRowP.id,
                          x: oBoundsL.left,
                          y: oBoundsL.bottom + 4,
                          trigger: oEventP.currentTarget,
                        });
                      }}
                    >
                      &#8942;
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!rows.length && (
              <tr>
                <td colSpan={aColumnsL.length + 2} className="empty">
                  {emptyMessage || `No ${rowLabel} match your filters.`}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="grid-pagination">
        <span>
          Showing {rows.length ? (nCurrentL - 1) * nPageSizeL + 1 : 0} to{' '}
          {Math.min(nCurrentL * nPageSizeL, rows.length)} of {rows.length} entries
        </span>
        <div className="pagination-controls">
          <label>
            Rows per page{' '}
            <select
              aria-label="Rows per page"
              value={nPageSizeL}
              onChange={(oEventP) => setPageSize(Number(oEventP.target.value))}
            >
              {[10, 25, 50].map((nSizeP) => (
                <option key={nSizeP}>{nSizeP}</option>
              ))}
            </select>
          </label>
          <button
            type="button"
            aria-label="First page"
            disabled={nCurrentL === 1}
            onClick={() => setPage(1)}
          >
            &laquo;
          </button>
          <button
            type="button"
            aria-label="Previous page"
            disabled={nCurrentL === 1}
            onClick={() => setPage(nCurrentL - 1)}
          >
            &lsaquo;
          </button>
          {Array.from(
            { length: Math.min(5, nPagesL) },
            (_, nIndexP) => Math.min(Math.max(1, nCurrentL - 2), Math.max(1, nPagesL - 4)) + nIndexP
          ).map((nValueP) => (
            <button
              type="button"
              key={nValueP}
              className={nCurrentL === nValueP ? 'current-page' : ''}
              aria-current={nCurrentL === nValueP ? 'page' : undefined}
              aria-label={`Page ${nValueP}`}
              onClick={() => setPage(nValueP)}
            >
              {nValueP}
            </button>
          ))}
          <button
            type="button"
            aria-label="Next page"
            disabled={nCurrentL === nPagesL}
            onClick={() => setPage(nCurrentL + 1)}
          >
            &rsaquo;
          </button>
          <button
            type="button"
            aria-label="Last page"
            disabled={nCurrentL === nPagesL}
            onClick={() => setPage(nPagesL)}
          >
            &raquo;
          </button>
        </div>
      </div>
      {oMenuL &&
        oRowL &&
        !actionsDisabled &&
        createPortal(
          <div
            ref={oMenuRefL}
            id={`${gridId}-menu`}
            role="menu"
            aria-label={`Actions for ${rowLabel} ${oRowL.id}`}
            className="row-context-menu"
            style={{ left: oMenuL.x, top: oMenuL.y }}
            onKeyDown={(oEventP) => {
              const aButtonsL = Array.from(
                oEventP.currentTarget.querySelectorAll<HTMLButtonElement>('button')
              );
              const nIndexL = aButtonsL.indexOf(document.activeElement as HTMLButtonElement);
              if (oEventP.key === 'Escape') {
                oEventP.preventDefault();
                closeMenu(true);
              } else if (oEventP.key === 'Tab') {
                oEventP.preventDefault();
                closeMenu(true);
              } else if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(oEventP.key)) {
                oEventP.preventDefault();
                const nNextL =
                  oEventP.key === 'Home'
                    ? 0
                    : oEventP.key === 'End'
                      ? aButtonsL.length - 1
                      : (nIndexL + (oEventP.key === 'ArrowDown' ? 1 : -1) + aButtonsL.length) %
                        aButtonsL.length;
                aButtonsL[nNextL]?.focus();
              }
            }}
          >
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                closeMenu(true);
                onView(oRowL);
              }}
            >
              View
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                closeMenu(true);
                onUpdate(oRowL);
              }}
            >
              Update
            </button>
            {onDelete && (
              <button
                type="button"
                role="menuitem"
                className="danger"
                onClick={() => {
                  closeMenu(true);
                  onDelete(oRowL);
                }}
              >
                Delete
              </button>
            )}
          </div>,
          document.body
        )}
    </section>
  );
}
