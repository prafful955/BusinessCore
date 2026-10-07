import { useEffect, useState, type FormEvent } from 'react';
import type { GridColumn } from '../../components/grid/AppGrid';
import RecordManager from '../shared/RecordManager';
import { categoryApi, type Category, type CategoryInput } from './category.api';
import { errorMessage } from '../business/business.api';

const columns: GridColumn<Category>[] = [
  { key: 'name', label: 'Category' },
  { key: 'description', label: 'Description' },
  { key: 'status', label: 'Status' },
  { key: 'version', label: 'Version' },
];
export default function CategoryDetails({ id }: { id: number }) {
  const [row, setRow] = useState<Category | null>(null);
  const [error, setError] = useState('');
  const [reload, setReload] = useState(0);
  useEffect(() => {
    let active = true;
    setRow(null);
    setError('');
    categoryApi
      .get(id)
      .then((row) => {
        if (active) setRow(row);
      })
      .catch((e) => {
        if (active) setError(errorMessage(e));
      });
    return () => {
      active = false;
    };
  }, [id, reload]);
  return (
    <>
      <header>
        <h1>Category details</h1>
        <a href="#/categories">Back to categories</a>
      </header>
      {error ? (
        <>
          <p role="alert" className="notice">
            {error}
          </p>
          <button onClick={() => setReload((x) => x + 1)}>Retry</button>
        </>
      ) : !row ? (
        <p role="status">Loading...</p>
      ) : (
        <section className="control-card">
          <h2>{row.name}</h2>
          <a href={'#/categories/' + id + '/edit'}>Update category</a>
          <dl className="business-details">
            <div>
              <dt>Description</dt>
              <dd>{row.description || '?'}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>{row.status}</dd>
            </div>
            <div>
              <dt>Version</dt>
              <dd>{row.version}</dd>
            </div>
            <div>
              <dt>Created</dt>
              <dd>{new Date(row.createdAt).toLocaleString()}</dd>
            </div>
            <div>
              <dt>Updated</dt>
              <dd>{new Date(row.updatedAt).toLocaleString()}</dd>
            </div>
          </dl>
          <button className="secondary" onClick={() => setReload((x) => x + 1)}>
            Refresh
          </button>
        </section>
      )}
    </>
  );
}
