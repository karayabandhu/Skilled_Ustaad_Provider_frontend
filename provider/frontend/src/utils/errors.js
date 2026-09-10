/**
 * Professional Error Handling Utility
 * Sanitizes technical error messages for user-friendly display.
 */
export const getFriendlyErrorMessage = (error, defaultMsg = "An unexpected error occurred. Please try again.") => {
  if (!error) return defaultMsg;

  // If it's already a string, return it if it's not a technical error
  if (typeof error === 'string') {
     const technicalTerms = ['error', 'failed', 'refused', 'status code', '404', '500', 'undefined', 'null'];
     const isTechnical = technicalTerms.some(term => error.toLowerCase().includes(term));
     return isTechnical ? defaultMsg : error;
  }

  // 1. Handle Axios Response Errors
  if (error.response) {
    const data = error.response.data;
    
    // Check for explicit error messages from our API
    if (data?.message && typeof data.message === 'string') return data.message;
    if (data?.error && typeof data.error === 'string') return data.error;

    // Handle common HTTP status codes
    switch (error.response.status) {
      case 400: return "Invalid request. Please check your information.";
      case 401: return "Your session has expired. Please log in again.";
      case 403: return "You do not have permission to perform this action.";
      case 404: return "The requested resource was not found.";
      case 500: return "Our server is having trouble. Please try again in 1-2 minutes.";
      case 502:
      case 503:
      case 504: return "Service is temporarily unavailable. Please try again shortly.";
      default: return defaultMsg;
    }
  }

  // 2. Handle Network Errors (Request sent but no response)
  if (error.request) {
    return "Connection error. Please check your internet and try again.";
  }

  // 3. Handle General Network Error
  if (error.message === "Network Error" || error.code === "ERR_NETWORK") {
    return "Unable to connect to the server. Please check your network.";
  }

  return defaultMsg;
};
