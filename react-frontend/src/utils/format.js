//src/utils/format.js

export function formatPrice(price) {
  return Number(price).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatDays(days) {
  return `${days} day${days === 1 ? "" : "s"}`;
}

export function formatDateTime(value) {
  return value ? new Date(value).toLocaleString() : "";
}
