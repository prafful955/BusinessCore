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
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Select</th>
              {columns.map((oColumnP) => (
                <th key={String(oColumnP.key)}>{oColumnP.label}</th>
              ))}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((oRowP) => (
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
                {columns.map((oColumnP) => (
                  <td key={String(oColumnP.key)}>
                    {oColumnP.render ? oColumnP.render(oRowP) : String(oRowP[oColumnP.key])}
                  </td>
                ))}
                <td>
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
                    Actions &#8942;
                  </button>
                </td>
              </tr>
            ))}
            {!rows.length && (
              <tr>
                <td colSpan={columns.length + 2} className="empty">
                  {emptyMessage || `No ${rowLabel} match your filters.`}
                </td>
              </tr>
            )}
          </tbody>
        </table>
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
