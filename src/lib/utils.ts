import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Malayalam number word to digit mapping
const malayalamNumberMap: Record<string, number> = {
  "പൂജ്യം": 0,
  "ഒന്ന്": 1,
  "രണ്ട്": 2,
  "മൂന്ന്": 3,
  "നാല്": 4,
  "അഞ്ച്": 5,
  "ആറ്": 6,
  "ഏഴ്": 7,
  "എട്ട്": 8,
  "ഒമ്പത്": 9,
  "പത്ത്": 10,
  // Add more as needed
};

/**
 * Parses a Malayalam number word and returns its digit value if found, otherwise returns undefined.
 * @param word Malayalam number word (e.g., "അഞ്ച്")
 * @returns number | undefined
 */
export function parseMalayalamNumber(word: string): number | undefined {
  return malayalamNumberMap[word.trim()];
}

export function formatDateDMY(dateString: string | Date): string {
  const d = new Date(dateString);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}
