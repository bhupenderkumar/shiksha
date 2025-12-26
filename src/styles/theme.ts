/**
 * Centralized Theme Configuration
 * 
 * This file contains all theme-related constants and utility classes
 * to ensure consistent dark/light mode support across the entire application.
 * 
 * Usage:
 * import { authPageStyles, cardStyles, inputStyles } from '@/styles/theme';
 */

// Auth Page Container Styles (Login, Register, ForgotPassword, etc.)
export const authPageStyles = {
  // Main container with gradient background
  container: "min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors duration-300",
  
  // Icon container
  iconWrapper: "p-4 bg-white dark:bg-gray-800 rounded-full shadow-lg transform transition-all hover:scale-110",
  
  // Icon color
  iconColor: "text-primary dark:text-primary",
  
  // Page title
  title: "mt-6 text-center text-3xl font-extrabold bg-gradient-to-r from-indigo-600 to-blue-500 dark:from-indigo-400 dark:to-blue-400 bg-clip-text text-transparent",
  
  // Subtitle/description text
  subtitle: "mt-2 text-center text-sm text-muted-foreground",
};

// Card Styles for forms
export const cardStyles = {
  // Main card container
  container: "bg-white dark:bg-gray-800 py-8 px-4 shadow-2xl shadow-indigo-100 dark:shadow-none dark:border dark:border-gray-700 sm:rounded-xl sm:px-10 transition-all duration-300 hover:shadow-xl dark:hover:shadow-lg dark:hover:shadow-indigo-900/20",
  
  // Card with simple shadow
  simple: "bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10 border dark:border-gray-700",
};

// Form Input Styles
export const inputStyles = {
  // Standard text input
  base: "appearance-none block w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white",
  
  // Input label
  label: "block text-sm font-medium text-gray-700 dark:text-gray-200",
  
  // Input with minimal styling
  minimal: "appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-primary focus:border-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white",
};

// Button Styles
export const buttonStyles = {
  // Primary gradient button
  primary: "w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-all duration-200 transform hover:scale-[1.02] dark:focus:ring-offset-gray-800",
  
  // Secondary/outline button
  secondary: "w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 dark:focus:ring-offset-gray-800",
  
  // Role selector button (active state)
  roleActive: "px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 bg-primary text-white",
  
  // Role selector button (inactive state)
  roleInactive: "px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600",
};

// Link Styles
export const linkStyles = {
  // Primary link color
  primary: "font-medium text-primary hover:text-primary/80 dark:text-indigo-400 dark:hover:text-indigo-300",
  
  // Link within text
  inline: "text-primary hover:text-primary/80 dark:text-indigo-400 dark:hover:text-indigo-300",
};

// Text Styles
export const textStyles = {
  // Muted text (descriptions, hints)
  muted: "text-muted-foreground",
  
  // Standard body text
  body: "text-foreground",
  
  // Small text with background (like "or" dividers)
  dividerText: "px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400",
};

// Divider Styles
export const dividerStyles = {
  // Horizontal divider line
  line: "w-full border-t border-gray-200 dark:border-gray-700",
};

// Loading Spinner Styles
export const loadingStyles = {
  // Spinner wrapper
  wrapper: "flex items-center",
  
  // Spinner element
  spinner: "w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2",
  
  // Full page loading
  fullPage: "h-screen w-screen flex items-center justify-center bg-background",
  
  // Loading circle
  circle: "animate-spin rounded-full h-32 w-32 border-b-2 border-primary",
};

// Alert/Error Styles
export const alertStyles = {
  // Error container
  error: "bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg p-6 mb-6",
  
  // Error title
  errorTitle: "text-4xl font-bold text-red-600 dark:text-red-400 mb-4",
  
  // Error text
  errorText: "text-lg mb-4 text-foreground",
  
  // Success container
  success: "bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg p-6 mb-6",
  
  // Success title
  successTitle: "text-xl font-bold text-green-700 dark:text-green-400 mb-2",
  
  // Success text
  successText: "text-green-600 dark:text-green-300",
  
  // Warning container
  warning: "bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-lg p-6 mb-6",
  
  // Warning title
  warningTitle: "text-xl font-bold text-yellow-700 dark:text-yellow-400 mb-2",
  
  // Warning text
  warningText: "text-yellow-600 dark:text-yellow-300",
  
  // Info container
  info: "bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-6 mb-6",
  
  // Info title
  infoTitle: "text-xl font-bold text-blue-700 dark:text-blue-400 mb-2",
  
  // Info text
  infoText: "text-blue-600 dark:text-blue-300",
  
  // Debug info box
  debugBox: "mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700",
  
  // Debug title
  debugTitle: "font-medium text-gray-800 dark:text-gray-200 mb-2",
  
  // Debug text
  debugText: "text-sm text-gray-600 dark:text-gray-400",
};
