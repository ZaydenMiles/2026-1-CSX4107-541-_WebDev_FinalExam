//src/utils/visual.js

// Small deterministic helpers, so a course or a person always gets the same colors

export function hashString(text) {
  let hash = 0;
  for (const char of String(text)) {
    hash = (hash * 31 + char.charCodeAt(0)) | 0;
  }
  return Math.abs(hash);
}

const COVER_GRADIENTS = [
  ["#4F46E5", "#7C3AED"],
  ["#0EA5E9", "#4F46E5"],
  ["#059669", "#0EA5E9"],
  ["#F59E0B", "#E11D48"],
  ["#DB2777", "#7C3AED"],
  ["#0891B2", "#059669"],
];

export function coverGradient(seed) {
  const [from, to] = COVER_GRADIENTS[hashString(seed) % COVER_GRADIENTS.length];
  return `linear-gradient(135deg, ${from} 0%, ${to} 100%)`;
}

const AVATAR_COLORS = ["#4F46E5", "#0EA5E9", "#059669", "#D97706", "#DB2777", "#7C3AED", "#0891B2"];

export function avatarColor(seed) {
  return AVATAR_COLORS[hashString(seed) % AVATAR_COLORS.length];
}

export function initials(name) {
  const parts = String(name ?? "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return `${parts[0][0]}${parts[1]?.[0] ?? ""}`.toUpperCase();
}
