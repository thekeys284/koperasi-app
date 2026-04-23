// src/utils/format.js

/**
 * Format a numeric value to Indonesian Rupiah currency string.
 * Example: 1500000 → "Rp 1.500.000"
 */
export const formatCurrency = (value) => {
  const number = Number(value || 0);
  return `Rp ${new Intl.NumberFormat("id-ID").format(number)}`;
};

/**
 * Format a date/value to "DD Mon YYYY" (Indonesian locale).
 */
export const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};
