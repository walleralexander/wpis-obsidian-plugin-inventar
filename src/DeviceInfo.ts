/**
 * Device information and hostname sanitization
 */

/**
 * Get the device name (hostname) and sanitize it for use in filenames
 * @returns Sanitized device name
 */
export function getDeviceName(): string {
  try {
    // Try to load Node.js os module (Desktop only)
    if (typeof process !== "undefined" && process.versions?.node) {
      const os = require("os");
      const hostname = os.hostname();
      return sanitizeFilename(hostname);
    }
  } catch (e) {
    // Mobile or no Node.js available
  }

  // Fallback for Mobile or if os module not available
  return sanitizeFilename("Unknown");
}

/**
 * Sanitize a string for safe use in filenames
 * Replaces invalid characters with hyphens
 * 
 * Invalid characters: \ / : * ? " < > |
 * Also trims leading/trailing whitespace
 * 
 * @param input String to sanitize
 * @returns Sanitized string safe for filenames
 */
export function sanitizeFilename(input: string): string {
  if (!input || input.trim().length === 0) {
    return "Unknown";
  }

  // Replace invalid filename characters with hyphen
  const invalidChars = /[\\/:"*?<>|]/g;
  let sanitized = input.replace(invalidChars, "-");

  // Trim leading/trailing whitespace and replace internal spaces with hyphens
  sanitized = sanitized.trim();

  // Collapse multiple hyphens into single
  sanitized = sanitized.replace(/-+/g, "-");

  return sanitized || "Unknown";
}
