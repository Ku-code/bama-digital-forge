/**
 * Helper functions for consistent toast error messages
 */

import { getErrorMessage } from './error-handling';

/**
 * Create a standardized error toast with title and description
 */
export const createErrorToast = (
  error: any,
  defaultTitle: string,
  defaultDescription?: string,
  t?: (key: string, fallback?: string) => string
): { title: string; description: string; variant: 'destructive' } => {
  const errorMessage = getErrorMessage(error);
  
  // Use translation if available, otherwise use defaults
  const title = t 
    ? (t(`error.${defaultTitle.toLowerCase().replace(/\s+/g, '.')}.title`) || defaultTitle)
    : defaultTitle;
    
  const description = errorMessage || defaultDescription || 'An error occurred. Please try again.';
  
  return {
    title,
    description,
    variant: 'destructive' as const,
  };
};

/**
 * Create a success toast with title and description
 */
export const createSuccessToast = (
  title: string,
  description: string,
  t?: (key: string, fallback?: string) => string
): { title: string; description: string } => {
  return {
    title: t ? (t(`success.${title.toLowerCase().replace(/\s+/g, '.')}.title`) || title) : title,
    description: t ? (t(`success.${title.toLowerCase().replace(/\s+/g, '.')}.description`) || description) : description,
  };
};

