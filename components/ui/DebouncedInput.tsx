'use client';

import { useEffect, useRef, useState } from 'react';
import { Input, type InputProps } from './Input';

const DEFAULT_DEBOUNCE_MS = 200;

export interface DebouncedInputProps extends Omit<InputProps, 'value' | 'onChange' | 'defaultValue'> {
  /** The committed/applied value — e.g. whatever currently drives the URL/search. */
  value: string;
  /** Called after the user pauses typing (or presses Enter) with the new value. */
  onCommit: (value: string) => void;
  debounceMs?: number;
}

// Shared by every search/filter text input in the app (vehicle listings,
// carpool trip filters, price fields, etc): types into local state instantly
// — so the field never lags or drops keystrokes — and only calls onCommit
// once the user pauses, matching the "Input State vs Applied Search State"
// split this was built to fix. Enter commits immediately, skipping the wait.
//
// `value` is the source of truth from outside (the URL, typically) and only
// resyncs local state when it changes for a reason OTHER than our own last
// commit (e.g. a "Clear filters" button, or browser back/forward) — never as
// an echo of the commit we just made, which would otherwise risk clobbering
// whatever the user has already typed past it in the meantime.
export function DebouncedInput({ value, onCommit, debounceMs = DEFAULT_DEBOUNCE_MS, onKeyDown, ...inputProps }: DebouncedInputProps) {
  const [local, setLocal] = useState(value);
  const lastCommittedRef = useRef(value);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (value !== lastCommittedRef.current) {
      setLocal(value);
      lastCommittedRef.current = value;
    }
  }, [value]);

  useEffect(() => () => clearTimeout(debounceRef.current), []);

  const commitNow = (text: string) => {
    clearTimeout(debounceRef.current);
    if (text === lastCommittedRef.current) return; // avoid a redundant identical commit (e.g. Enter right after the debounce already fired)
    lastCommittedRef.current = text;
    onCommit(text);
  };

  const handleChange = (text: string) => {
    setLocal(text);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => commitNow(text), debounceMs);
  };

  return (
    <Input
      {...inputProps}
      value={local}
      onChange={(e) => handleChange(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          commitNow(local);
        }
        onKeyDown?.(e);
      }}
    />
  );
}
