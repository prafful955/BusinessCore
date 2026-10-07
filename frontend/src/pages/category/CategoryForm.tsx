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
export default function CategoryForm({ id }: { id?: number }) {
  const [draft, setDraft] = useState<CategoryInput>({
    name: '',
    description: '',
    status: 'Active',
  });
  const [loading, setLoading] = useState(id !== undefined);
  const [loadFailed, setLoadFailed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [reload, setReload] = useState(0);
  useEffect(() => {
    if (id === undefined) return;
    let active = true;
    setLoading(true);
    setError('');
    setLoadFailed(false);
    categoryApi
      .get(id)
      .then((row) => {
        if (active)
          setDraft({
            name: row.name,
            description: row.description,
            status: row.status,
            version: row.version,
          });
      })
      .catch((e) => {
        if (active) {
          setError(errorMessage(e));
          setLoadFailed(true);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id, reload]);
  async function save(e: FormEvent) {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    setError('');
    try {
      const row =
        id === undefined ? await categoryApi.create(draft) : await categoryApi.update(id, draft);
      window.location.hash = '/categories/' + row.id;
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setSaving(false);
    }
  }
  return (
    <>
      <header>
        <h1>{id === undefined ? 'New category' : 'Update category'}</h1>
        <a href="#/categories">Back to categories</a>
      </header>
      {error && (
        <p role="alert" className="notice">
          {error}
        </p>
      )}
      {loading ? (
        <p role="status">Loading...</p>
      ) : loadFailed ? (
        <button onClick={() => setReload((x) => x + 1)}>Retry</button>
      ) : (
        <form onSubmit={save}>
          <fieldset className="role-fieldset" disabled={saving}>
            <section className="control-card">
              <label className="field">
                <span>Name *</span>
                <input
                  required
                  maxLength={100}
                  value={draft.name}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                />
              </label>
              <label className="field">
                <span>Description</span>
                <textarea
                  maxLength={10000}
                  value={draft.description}
                  onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                />
              </label>
              <label className="field">
                <span>Status *</span>
                <select
                  value={draft.status}
                  onChange={(e) => setDraft({ ...draft, status: e.target.value })}
                >
                  <option>Active</option>
                  <option>Inactive</option>
                </select>
              </label>
              {draft.version !== undefined && <p>Editing version {draft.version}</p>}
            </section>
            <div className="toolbar">
              <button>{saving ? 'Saving...' : 'Save category'}</button>
              <a href="#/categories">Cancel</a>
              {id !== undefined && (
                <button type="button" className="secondary" onClick={() => setReload((x) => x + 1)}>
                  Reload latest category
                </button>
              )}
            </div>
          </fieldset>
        </form>
      )}
    </>
  );
}
