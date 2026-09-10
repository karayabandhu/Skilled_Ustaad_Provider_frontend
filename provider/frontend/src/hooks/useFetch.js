import { useState, useEffect, useCallback } from 'react';
import { logger } from '../utils/logger';

/**
 * useFetch - Standardized data fetching hook
 * @param {Function} apiFunc - The API function from services/api.js
 * @param {Array} dependencies - Dependencies that trigger a re-fetch
 * @param {Object} options - { immediate: bool, onSuccess: func, onError: func }
 */
export const useFetch = (apiFunc, dependencies = [], options = {}) => {
  const { 
    immediate = true, 
    pollingInterval = 30000, 
    onSuccess, 
    onError 
  } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);

  const execute = useCallback(async (...args) => {
    try {
      setLoading(true);
      setError(null);
      const startTime = performance.now();
      
      const response = await apiFunc(...args);
      
      const duration = performance.now() - startTime;
      logger.info(`API Success: ${apiFunc.name || 'anonymous'} took ${duration.toFixed(2)}ms`);
      
      const result = response.data?.data || response.data;
      setData(result);
      
      if (onSuccess) onSuccess(result);
      return result;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'An unexpected error occurred';
      setError(errorMessage);
      logger.error(`API Error: ${apiFunc.name || 'anonymous'}`, { message: errorMessage, status: err.response?.status });
      
      if (onError) onError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [apiFunc, onSuccess, onError]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, dependencies);

  useEffect(() => {
    if (pollingInterval > 0) {
      const interval = setInterval(() => {
        execute();
      }, pollingInterval);
      return () => clearInterval(interval);
    }
  }, [execute, pollingInterval]);

  return { data, loading, error, refresh: execute, setData };
};
