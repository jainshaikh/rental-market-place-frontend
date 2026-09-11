'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { useMapsLibrary } from '@vis.gl/react-google-maps';
import { cn } from '../../lib/utils/cn';
import { setActiveAutocomplete, subscribeActiveAutocomplete } from './activeAutocomplete';

export interface PlaceLocation {
  description: string;
  formattedAddress: string;
  lat: number;
  lng: number;
}

interface PlaceAutocompleteInputProps {
  value: string;
  onValueChange: (text: string) => void;
  onPlaceSelected: (place: PlaceLocation) => void;
  placeholder?: string;
  className?: string;
  /** CLDR region codes to bias/restrict results, e.g. ['PK', 'AE', 'SA']. */
  regionCodes?: string[];
  id?: string;
}

const DEBOUNCE_MS = 300;

// Places API (New) has no drop-in autocomplete widget for a fully custom
// (Tailwind-styled) input — this builds one directly on the documented
// programmatic surface: AutocompleteSuggestion.fetchAutocompleteSuggestions
// + PlacePrediction.toPlace().fetchFields(). A session token is shared across
// keystrokes and discarded once a place is fetched, per Google's billing
// guidance (one session's worth of keystrokes + the details call = one charge).
export function PlaceAutocompleteInput({
  value,
  onValueChange,
  onPlaceSelected,
  placeholder,
  className,
  regionCodes,
  id,
}: PlaceAutocompleteInputProps) {
  const placesLib = useMapsLibrary('places');
  const [suggestions, setSuggestions] = useState<google.maps.places.AutocompleteSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const sessionTokenRef = useRef<google.maps.places.AutocompleteSessionToken | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const containerRef = useRef<HTMLDivElement>(null);
  const instanceId = useId();

  useEffect(() => {
    if (placesLib && !sessionTokenRef.current) {
      sessionTokenRef.current = new placesLib.AutocompleteSessionToken();
    }
  }, [placesLib]);

  useEffect(() => () => clearTimeout(debounceRef.current), []);

  // Only one PlaceAutocompleteInput's dropdown may be open at a time — when a
  // different instance activates (another field gains focus, or a page-level
  // "near me" box opens its own list), close this one immediately.
  useEffect(() => subscribeActiveAutocomplete((activeId) => {
    if (activeId !== instanceId) setOpen(false);
  }), [instanceId]);

  // Closes on any click/tap outside this field's input+dropdown — the map,
  // another field's container, buttons, blank page background, anything.
  // Distinct from the active-instance subscription above: that one handles
  // "another autocomplete took focus", this one handles "the user clicked
  // away from autocompletes entirely".
  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // openOnResult=false is for the mount/library-load bootstrap below — a
  // field can already hold a value on mount (e.g. LocationSearch prefilling
  // the last-picked "near me" area from a cookie on every page it appears
  // on), and that is not the user typing, so it must never pop the dropdown
  // open on its own. Only an actual keystroke (handleInputChange) opens it.
  const fetchSuggestions = (text: string, openOnResult = true) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!placesLib || !text.trim()) {
      setSuggestions([]);
      if (openOnResult) setOpen(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      try {
        const { suggestions: results } = await placesLib.AutocompleteSuggestion.fetchAutocompleteSuggestions({
          input: text,
          sessionToken: sessionTokenRef.current ?? undefined,
          includedRegionCodes: regionCodes,
        });
        setSuggestions(results);
        if (openOnResult) {
          setOpen(results.length > 0);
          if (results.length > 0) setActiveAutocomplete(instanceId);
        }
      } catch {
        setSuggestions([]);
        if (openOnResult) setOpen(false);
      }
    }, DEBOUNCE_MS);
  };

  // The Maps JS script loads lazily on first mount, so `placesLib` is often
  // still null for the first keystroke or two. This keeps a pre-filled value
  // "primed" (suggestions ready the moment the field is focused) once the
  // library catches up, without forcing the dropdown open on its own — see
  // the openOnResult note above.
  useEffect(() => {
    if (placesLib && value.trim()) fetchSuggestions(value, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [placesLib]);

  const handleInputChange = (text: string) => {
    onValueChange(text);
    fetchSuggestions(text);
  };

  const handleSelect = async (suggestion: google.maps.places.AutocompleteSuggestion) => {
    const prediction = suggestion.placePrediction;
    if (!prediction || !placesLib) return;
    setOpen(false);
    setActiveAutocomplete(null);

    const place = prediction.toPlace();
    await place.fetchFields({ fields: ['location', 'formattedAddress'] });
    if (!place.location) return;

    const description = prediction.text.text;
    onValueChange(description);
    onPlaceSelected({
      description,
      formattedAddress: place.formattedAddress ?? description,
      lat: place.location.lat(),
      lng: place.location.lng(),
    });

    // A session ends once a place's details are fetched — start a fresh one
    // for the next search rather than reusing a spent token.
    sessionTokenRef.current = new placesLib.AutocompleteSessionToken();
  };

  return (
    <div ref={containerRef} className="relative min-w-0 flex-1">
      <input
        id={id}
        type="text"
        value={value}
        onChange={(e) => handleInputChange(e.target.value)}
        onFocus={() => {
          // Claiming "active" on focus alone (not just once suggestions
          // arrive) is what makes clicking straight from Pickup into
          // Drop-off close Pickup's list immediately, even before Drop-off
          // has typed anything of its own yet.
          setActiveAutocomplete(instanceId);
          if (suggestions.length > 0) setOpen(true);
        }}
        placeholder={placeholder}
        autoComplete="off"
        className={className}
      />
      {open && suggestions.length > 0 && (
        <ul className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
          {suggestions.map((s, i) => (
            <li key={s.placePrediction?.placeId ?? i}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSelect(s)}
                className={cn(
                  'block w-full px-3.5 py-2 text-left text-sm text-slate-700 hover:bg-slate-50',
                )}
              >
                {s.placePrediction?.text.text}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
