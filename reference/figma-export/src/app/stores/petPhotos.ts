// Module-level store for pet photo data URLs, keyed by pet ID.
// Survives re-renders but resets on page reload.
export const petPhotos: Record<string, string> = {};
