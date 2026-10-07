import React, { useState, type KeyboardEvent, type MouseEvent } from 'react';
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
};
export function AppGrid<T extends { id: number }>({
  gridId,
  title,
  rowLabel = 'employees',
  rows,
  columns,
  selectedId,
  onSelect,
  onView,
  onUpdate,
  onDelete,
}: Props<T>) {
  const [menu, setMenu] = useState<number | null>(null);
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
              {columns.map((c) => (
                <th key={String(c.key)}>{c.label}</th>
              ))}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.id}
                className={selectedId === row.id ? 'selected' : ''}
                onContextMenu={(e: MouseEvent<HTMLTableRowElement>) => {
                  e.preventDefault();
                  onSelect(row);
                  setMenu(row.id);
                }}
              >
                <td>
                  <input
                    type="radio"
                    name={`${gridId}-selection`}
                    aria-label={`Select ${rowLabel} ${row.id}`}
                    checked={selectedId === row.id}
                    onChange={() => onSelect(row)}
                  />
                </td>
                {columns.map((c) => (
                  <td key={String(c.key)}>{c.render ? c.render(row) : String(row[c.key])}</td>
                ))}
                <td>
                  <button
                    className="secondary"
                    aria-label={`Actions for ${rowLabel} ${row.id}`}
                    aria-expanded={menu === row.id}
                    onClick={() => setMenu(menu === row.id ? null : row.id)}
                  >
                    Actions ▾
                  </button>
                  {menu === row.id && (
                    <div
                      className="row-menu"
                      onKeyDown={(e: KeyboardEvent<HTMLDivElement>) => {
                        if (e.key === 'Escape') setMenu(null);
                      }}
                    >
                      <button
                        onClick={() => {
                          setMenu(null);
                          onView(row);
                        }}
                      >
                        View
                      </button>
                      <button
                        onClick={() => {
                          setMenu(null);
                          onUpdate(row);
                        }}
                      >
                        Update
                      </button>
                      {onDelete && (
                        <button
                          className="danger"
                          onClick={() => {
                            setMenu(null);
                            onDelete(row);
                          }}
                        >
                          Delete
                        </button>
                      )}
                      <button className="secondary" onClick={() => setMenu(null)}>
                        Close
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {!rows.length && (
              <tr>
                <td colSpan={columns.length + 2} className="empty">
                  No {rowLabel} match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
