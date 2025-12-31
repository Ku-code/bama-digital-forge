/**
 * Error handling utilities for Supabase operations
 */

export interface RetryOptions {
  maxRetries?: number;
  retryDelay?: number;
  retryableErrors?: string[];
}

const DEFAULT_RETRY_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  retryDelay: 1000, // 1 second
  retryableErrors: [
    'network',
    'timeout',
    'ECONNRESET',
    'ETIMEDOUT',
    'ENOTFOUND',
  ],
};

/**
 * Check if error is retryable
 */
const isRetryableError = (error: any, retryableErrors: string[]): boolean => {
  const errorMessage = error?.message?.toLowerCase() || '';
  const errorCode = error?.code?.toLowerCase() || '';
  
  return retryableErrors.some(
    (retryable) =>
      errorMessage.includes(retryable.toLowerCase()) ||
      errorCode.includes(retryable.toLowerCase())
  );
};

/**
 * Check if device is online
 */
export const isOnline = (): boolean => {
  return navigator.onLine;
};

/**
 * Retry a function with exponential backoff
 */
export const withRetry = async <T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> => {
  const opts = { ...DEFAULT_RETRY_OPTIONS, ...options };
  let lastError: any;

  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;

      // Don't retry if it's the last attempt or error is not retryable
      if (attempt === opts.maxRetries || !isRetryableError(error, opts.retryableErrors)) {
        throw error;
      }

      // Calculate delay with exponential backoff
      const delay = opts.retryDelay * Math.pow(2, attempt);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
};

/**
 * Execute a Supabase operation with retry and offline detection
 */
export const withSupabaseRetry = async <T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> => {
  if (!isOnline()) {
    throw new Error('Device is offline. Please check your internet connection.');
  }

  return withRetry(operation, options);
};

/**
 * Handle Supabase errors and provide user-friendly messages
 */
export const handleSupabaseError = (error: any): string => {
  if (!error) {
    return 'An unknown error occurred.';
  }

  // Network errors
  if (!isOnline()) {
    return 'You are currently offline. Please check your internet connection and try again.';
  }

  // Supabase-specific errors
  if (error.code) {
    switch (error.code) {
      case 'PGRST116':
        return 'The requested item was not found.';
      case '23505':
        return 'This item already exists.';
      case '23503':
        return 'Cannot perform this operation due to related data.';
      case '42501':
        return 'You do not have permission to perform this action.';
      case 'PGRST301':
        return 'The request timed out. Please try again.';
      default:
        return error.message || 'An error occurred. Please try again.';
    }
  }

  // Generic error messages
  if (error.message) {
    if (error.message.includes('network') || error.message.includes('fetch')) {
      return 'Network error. Please check your internet connection and try again.';
    }
    if (error.message.includes('timeout')) {
      return 'The request took too long. Please try again.';
    }
    return error.message;
  }

  return 'An unexpected error occurred. Please try again.';
};

/**
 * Format error for toast notification with title and description
 */
export interface ErrorToast {
  title: string;
  description: string;
}

/**
 * Create a standardized error toast object
 */
export const createErrorToast = (
  error: any,
  defaultTitle: string = 'Error',
  defaultDescription: string = 'An error occurred. Please try again.',
  customTitle?: string,
  customDescription?: string
): ErrorToast => {
  const errorMessage = handleSupabaseError(error);
  
  return {
    title: customTitle || defaultTitle,
    description: customDescription || errorMessage || defaultDescription,
  };
};

/**
 * Get user-friendly error message based on error type
 */
export const getErrorMessage = (error: any, context?: string): string => {
  if (!error) {
    return 'An unknown error occurred.';
  }

  // Check for specific error patterns
  const errorStr = String(error.message || error).toLowerCase();

  // Authentication errors
  if (errorStr.includes('invalid login') || errorStr.includes('invalid_credentials')) {
    return 'Invalid email or password. Please check your credentials and try again.';
  }
  if (errorStr.includes('email not confirmed') || errorStr.includes('email_not_confirmed')) {
    return 'Please confirm your email address before logging in. Check your inbox for the confirmation link.';
  }
  if (errorStr.includes('user not found')) {
    return 'No account found with this email address.';
  }
  if (errorStr.includes('email already registered') || errorStr.includes('already registered')) {
    return 'An account with this email already exists. Please login instead.';
  }

  // Permission errors
  if (errorStr.includes('permission') || errorStr.includes('unauthorized') || errorStr.includes('forbidden')) {
    return 'You do not have permission to perform this action.';
  }

  // Network errors
  if (errorStr.includes('network') || errorStr.includes('fetch') || errorStr.includes('failed to fetch')) {
    return 'Network error. Please check your internet connection and try again.';
  }
  if (errorStr.includes('timeout') || errorStr.includes('timed out')) {
    return 'The request took too long. Please try again.';
  }
  if (!isOnline()) {
    return 'You are currently offline. Please check your internet connection and try again.';
  }

  // File upload errors
  if (errorStr.includes('file') && errorStr.includes('too large')) {
    return 'The file is too large. Please select a smaller file.';
  }
  if (errorStr.includes('invalid file') || errorStr.includes('unsupported file')) {
    return 'Invalid file type. Please select a supported file format.';
  }

  // Validation errors
  if (errorStr.includes('required') || errorStr.includes('missing')) {
    return 'Please fill in all required fields.';
  }
  if (errorStr.includes('invalid') && errorStr.includes('format')) {
    return 'Invalid format. Please check your input and try again.';
  }

  // Use the standard Supabase error handler
  return handleSupabaseError(error);
};

/**
 * Wrapper for async operations with error handling
 */
export const safeAsync = async <T>(
  operation: () => Promise<T>,
  onError?: (error: string) => void
): Promise<T | null> => {
  try {
    return await operation();
  } catch (error: any) {
    const errorMessage = handleSupabaseError(error);
    if (onError) {
      onError(errorMessage);
    } else {
      console.error('Operation failed:', errorMessage, error);
    }
    return null;
  }
};

