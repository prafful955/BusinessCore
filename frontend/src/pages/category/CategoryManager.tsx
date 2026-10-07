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
export default function CategoryManager() {
  return (
    <RecordManager
      title="Category"
      route="/categories"
      api={categoryApi}
      columns={columns}
      searchText={(row) => row.name + ' ' + row.description}
      displayName={(row) => row.name}
      deleteRecord={(row) => categoryApi.delete(row.id, row.version)}
    />
  );
}
