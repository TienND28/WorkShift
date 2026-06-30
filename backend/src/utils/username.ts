/**
 * Derive display username from email local part (before @).
 * e.g. "nguyen.van.a@gmail.com" → "nguyen.van.a"
 */
export const usernameFromEmail = (email: string): string => {
  const local = email.split("@")[0]?.trim().toLowerCase() ?? "";
  const sanitized = local.replace(/[^a-z0-9._-]/g, "").slice(0, 30);
  return sanitized || "user";
};

export const displayNameFromEmail = (email: string): string => {
  const username = usernameFromEmail(email);
  return username.replace(/[._-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
};
