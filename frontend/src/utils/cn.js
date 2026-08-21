/**
 * Class name merger utility
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}
