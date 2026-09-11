// Module-level (not React context) so it works across sibling instances
// regardless of where each PlaceAutocompleteInput sits in the tree — pickup
// and drop-off rows, a provider's showroom field, and the "near me" search
// boxes are never under one common ancestor we control. Only one instance's
// dropdown may be open at a time; activating one closes every other.
type Listener = (activeId: string | null) => void;

let activeId: string | null = null;
const listeners = new Set<Listener>();

export function setActiveAutocomplete(id: string | null): void {
  activeId = id;
  listeners.forEach((fn) => fn(activeId));
}

export function subscribeActiveAutocomplete(fn: Listener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
