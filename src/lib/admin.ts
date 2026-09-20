export const ADMIN_EMAIL = "sergiochala96@gmail.com";

export function isAdmin(email?: string | null): boolean {
  return email === ADMIN_EMAIL;
}
