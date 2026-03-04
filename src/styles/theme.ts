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
  // Main container – clean white, mobile-first
  container: "min-h-[100dvh] bg-white flex flex-col items-center px-6 py-0 sm:py-8 sm:px-6 lg:px-8 overflow-auto",
  
  // Top branding area (logo + school name)
  brandingArea: "flex flex-col items-center pt-10 pb-4 sm:pt-14 sm:pb-6",
  
  // Logo wrapper – simple circle with light border
  logoWrapper: "w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white border border-gray-200 flex items-center justify-center p-1.5 shadow-sm",
  
  // Logo image
  logoImage: "w-full h-full rounded-full object-cover",
  
  // School name
  schoolName: "mt-3 text-center text-lg sm:text-xl font-semibold text-gray-900",
  
  // School tagline
  schoolTagline: "mt-0.5 text-center text-xs text-gray-400",
  
  // Form area
  formCard: "w-full max-w-sm px-0 py-4 sm:px-2 sm:py-6",
  
  // Form card title
  formTitle: "text-xl font-semibold text-gray-900 text-center",
  
  // Form card subtitle
  formSubtitle: "mt-1 text-sm text-gray-400 text-center",
  
  // Icon container (legacy compat)
  iconWrapper: "p-4 bg-white rounded-full shadow-sm border border-gray-100",
  
  // Icon color
  iconColor: "text-gray-700",
  
  // Page title (legacy compat)
  title: "mt-6 text-center text-2xl font-semibold text-gray-900",
  
  // Subtitle/description text
  subtitle: "mt-2 text-center text-sm text-gray-400",
};

// Card Styles for forms
export const cardStyles = {
  // Main card container
  container: "bg-white py-8 px-4 shadow-2xl shadow-indigo-100 sm:rounded-xl sm:px-10 transition-all duration-300 hover:shadow-xl",
  
  // Card with simple shadow
  simple: "bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border",
};

// Form Input Styles
export const inputStyles = {
  // Standard text input – clean with border
  base: "appearance-none block w-full px-4 py-3 border border-gray-200 rounded-lg placeholder-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-colors text-gray-900 text-sm",
  
  // Input label
  label: "block text-sm font-medium text-gray-600 mb-1.5",
  
  // Input with icon padding
  withIcon: "appearance-none block w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg placeholder-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-colors text-gray-900 text-sm",
  
  // Icon wrapper positioned inside input
  iconWrapper: "absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400",
  
  // Input with minimal styling
  minimal: "appearance-none block w-full px-3 py-2 border border-gray-200 rounded-md placeholder-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 bg-white text-gray-900",
};

// Button Styles
export const buttonStyles = {
  // Primary button – solid dark, clean
  primary: "w-full flex justify-center items-center py-3 px-4 rounded-lg text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:opacity-50 transition-colors active:scale-[0.98]",
  
  // Secondary/outline button
  secondary: "w-full flex justify-center py-3 px-4 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-gray-900 disabled:opacity-50 transition-colors",
  
  // Role selector button (active state)
  roleActive: "flex-1 px-4 py-3 text-sm font-medium rounded-lg transition-colors bg-gray-900 text-white",
  
  // Role selector button (inactive state)
  roleInactive: "flex-1 px-4 py-3 text-sm font-medium rounded-lg transition-colors border border-gray-200 text-gray-500 hover:bg-gray-50",
};

// Link Styles
export const linkStyles = {
  // Primary link color
  primary: "font-medium text-primary hover:text-primary/80",
  
  // Link within text
  inline: "text-primary hover:text-primary/80",
};

// Text Styles
export const textStyles = {
  // Muted text (descriptions, hints)
  muted: "text-muted-foreground",
  
  // Standard body text
  body: "text-foreground",
  
  // Small text with background (like "or" dividers)
  dividerText: "px-2 bg-white text-gray-500",
};

// Divider Styles
export const dividerStyles = {
  // Horizontal divider line
  line: "w-full border-t border-gray-200",
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
  error: "bg-red-50 border border-red-200 rounded-lg p-6 mb-6",
  
  // Error title
  errorTitle: "text-4xl font-bold text-red-600 mb-4",
  
  // Error text
  errorText: "text-lg mb-4 text-foreground",
  
  // Success container
  success: "bg-green-50 border border-green-200 rounded-lg p-6 mb-6",
  
  // Success title
  successTitle: "text-xl font-bold text-green-700 mb-2",
  
  // Success text
  successText: "text-green-600",
  
  // Warning container
  warning: "bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6",
  
  // Warning title
  warningTitle: "text-xl font-bold text-yellow-700 mb-2",
  
  // Warning text
  warningText: "text-yellow-600",
  
  // Info container
  info: "bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6",
  
  // Info title
  infoTitle: "text-xl font-bold text-blue-700 mb-2",
  
  // Info text
  infoText: "text-blue-600",
  
  // Debug info box
  debugBox: "mt-4 p-4 bg-white rounded-lg border border-gray-200",
  
  // Debug title
  debugTitle: "font-medium text-gray-800 mb-2",
  
  // Debug text
  debugText: "text-sm text-gray-600",
};
