/**
 * Security Utilities
 * Handles sensitive data scrubbing and security-related checks.
 */

const SENSITIVE_KEYS = [
  "password",
  "token",
  "accessToken",
  "refreshToken",
  "secret",
  "auth",
  "credit_card",
  "cvv",
  "otp",
];

/**
 * Recursively scrubs sensitive information from objects
 */
export const scrubData = (data) => {
  if (!data || typeof data !== "object") return data;

  if (Array.isArray(data)) {
    return data.map(scrubData);
  }

  const scrubbed = {};
  for (const [key, value] of Object.entries(data)) {
    if (SENSITIVE_KEYS.some((s) => key.toLowerCase().includes(s))) {
      scrubbed[key] = "[REDACTED]";
    } else {
      scrubbed[key] = scrubData(value);
    }
  }
  return scrubbed;
};

/**
 * Configure global secure headers or behaviors if needed
 */
export const initializeSecurity = () => {
    // Prevent some forms of clickjacking if not in an iframe
    if (window.self !== window.top) {
        // Log potential iframe embedding in production
        console.warn("Application is being embedded in an iframe.");
    }
};
