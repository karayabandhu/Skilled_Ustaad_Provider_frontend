/**
 * Lightweight Web Vitals Monitoring
 * This utility tracks key performance metrics (LCP, FID, CLS, TTFB, FCP)
 * and logs them for production analysis.
 */

import { API_BASE } from "../services/api";

export const reportWebVitals = (onPerfEntry) => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import('web-vitals').then(({ onCLS, onFID, onFCP, onLCP, onTTFB }) => {
      onCLS(onPerfEntry);
      onFID(onPerfEntry);
      onFCP(onPerfEntry);
      onLCP(onPerfEntry);
      onTTFB(onPerfEntry);
    }).catch((e) => {
      // Fallback if web-vitals is not available or fails to load
      console.warn('Web Vitals monitoring could not be initialized.', e);
    });
  }
};

/**
 * Log performance metrics to console in development
 * and potentially to an analytics endpoint in production.
 */
export const logVitals = (metric) => {
  const body = JSON.stringify(metric);
  const url = `${API_BASE}/analytics/vitals`; // Hypothetical endpoint

  if (import.meta.env.DEV) {
    // console.log('[Web Vitals] ', metric.name, metric.value);
  } else {
    // In production, logging is disabled until backend analytics endpoint is ready
    // to prevent 404 errors.
    /*
    if (navigator.sendBeacon) {
      navigator.sendBeacon(url, body);
    } else {
      fetch(url, { body, method: 'POST', keepalive: true }).catch(() => {});
    }
    */
  }
};
