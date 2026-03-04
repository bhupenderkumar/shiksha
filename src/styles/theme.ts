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
  container: "min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors duration-300",
  
  // Icon container
  iconWrapper: "p-4 bg-white rounded-full shadow-lg transform transition-all hover:scale-110",
  
  // Icon color
  iconColor: "text-primary",
  
  // Page title
  title: "mt-6 text-center text-3xl font-extrabold bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent",
  
  // Subtitle/description text
  subtitle: "mt-2 text-center text-sm text-muted-foreground",
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
  // Standard text input
  base: "appearance-none block w-full px-4 py-3 border border-gray-200 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 bg-white text-gray-900",
  
  // Input label
  label: "block text-sm font-medium text-gray-700",
  
  // Input with minimal styling
  minimal: "appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary bg-white text-gray-900",
};

// Button Styles
export const buttonStyles = {
  // Primary gradient button
  primary: "w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-all duration-200 transform hover:scale-[1.02]",
  
  // Secondary/outline button
  secondary: "w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50",
  
  // Role selector button (active state)
  roleActive: "px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 bg-primary text-white",
  
  // Role selector button (inactive state)
  roleInactive: "px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50",
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
