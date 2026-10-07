/** @jsxRuntime classic */
/** @jsx React.createElement */

import React, { useMemo, useState } from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

type AppSelectProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
};

export const AppSelect = ({
  label,
  value,
  onChange,
  options,
}: AppSelectProps) => (
  <label className="field">
    <span>{label}</span>
    <select value={value} onChange={(e) => onChange(e.target.value)}>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  </label>
);

type AppMultiSelectProps = {
  label: string;
  options: string[];
};

export function AppMultiSelect({ label, options }: AppMultiSelectProps) {
  const [selected, setSelected] = useState<string[]>([]);

  const toggleOption = (option: string) => {
    setSelected((current) =>
      current.includes(option)
        ? current.filter((item) => item !== option)
        : [...current, option]
    );
  };

  return (
    <div className="field">
      <span>{label}</span>

      <div className="multi">
        {options.map((option) => (
          <label key={option}>
            <input
              type="checkbox"
              checked={selected.includes(option)}
              onChange={() => toggleOption(option)}
            />
            {option}
          </label>
        ))}
      </div>

      <small>Selected: {selected.join(', ') || 'None'}</small>
    </div>
  );
}

type AppAutocompleteProps = {
  label: string;
  options: string[];
};

export function AppAutocomplete({ label, options }: AppAutocompleteProps) {
  const [value, setValue] = useState('');

  const filteredOptions = useMemo(
    () =>
      options
        .filter((option) =>
          option.toLowerCase().includes(value.toLowerCase())
        )
        .slice(0, 6),
    [value, options]
  );

  return (
    <label className="field lookup">
      <span>{label}</span>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Type to search..."
      />

      {value && (
        <div className="lookup-list">
          {filteredOptions.map((option) => (
            <button type="button" key={option} onClick={() => setValue(option)}>
              {option}
            </button>
          ))}
        </div>
      )}
    </label>
  );
}
