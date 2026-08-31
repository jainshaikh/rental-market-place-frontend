'use client';

import { useEffect, useRef, useState } from 'react';
import { useMapsLibrary } from '@vis.gl/react-google-maps';
import { cn } from '../../lib/utils/cn';

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

  useEffect(() => {
    if (placesLib && !sessionTokenRef.current) {
      sessionTokenRef.current = new placesLib.AutocompleteSessionToken();
    }
  }, [placesLib]);

  useEffect(() => () => clearTimeout(debounceRef.current), []);

  const fetchSuggestions = (text: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!placesLib || !text.trim()) {
      setSuggestions([]);
      setOpen(false);
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
        setOpen(results.length > 0);
      } catch {
        setSuggestions([]);
        setOpen(false);
      }
    }, DEBOUNCE_MS);
  };

  // The Maps JS script loads lazily on first mount, so `placesLib` is often
  // still null for the first keystroke or two — without this, that initial
  // input would silently produce no suggestions and never retry once the
  // library finishes loading a moment later.
  useEffect(() => {
    if (placesLib && value.trim()) fetchSuggestions(value);
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
    <div className="relative min-w-0 flex-1">
      <input
        id={id}
        type="text"
        value={value}
        onChange={(e) => handleInputChange(e.target.value)}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
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
