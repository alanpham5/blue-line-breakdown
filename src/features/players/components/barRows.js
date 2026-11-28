const SHAREABLE_ROWS = {
  compact: "1.75rem minmax(0, 1fr) 3.25rem",
  regular: "2rem minmax(0, 1fr) 3.75rem",
};

export const barRowsTemplate = (shareable, compact) => {
  if (!shareable) return "auto minmax(0, 1fr) auto";
  return compact ? SHAREABLE_ROWS.compact : SHAREABLE_ROWS.regular;
};
