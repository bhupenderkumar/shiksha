// This script helps identify which router configuration is being used in the application

// Check if App.tsx is importing and using the router from routes.tsx
const fs = require('fs');
const path = require('path');

try {
  // Read App.tsx
  const appContent = fs.readFileSync(path.join(__dirname, 'src', 'App.tsx'), 'utf8');
  
  // Check if App.tsx imports router from routes.tsx
  const importsRouter = appContent.includes('import { router } from');
  
  // Check if App.tsx uses RouterProvider
  const usesRouterProvider = appContent.includes('RouterProvider');
  
  console.log('=== Router Configuration Analysis ===');
  console.log(`App.tsx imports router from routes.tsx: ${importsRouter}`);
  console.log(`App.tsx uses RouterProvider: ${usesRouterProvider}`);
  
  if (importsRouter && usesRouterProvider) {
    console.log('\nCONFIGURATION: Using createBrowserRouter from routes.tsx');
  } else {
    console.log('\nCONFIGURATION: Using BrowserRouter directly in App.tsx');
  }
  
  // Check if main.tsx imports router from routes.tsx
  const mainContent = fs.readFileSync(path.join(__dirname, 'src', 'main.tsx'), 'utf8');
  const mainImportsRouter = mainContent.includes('import { router } from');
  const mainUsesRouterProvider = mainContent.includes('RouterProvider');
  
  console.log(`\nmain.tsx imports router from routes.tsx: ${mainImportsRouter}`);
  console.log(`main.tsx uses RouterProvider: ${mainUsesRouterProvider}`);
  
  if (mainImportsRouter && mainUsesRouterProvider) {
    console.log('\nCONFIGURATION: Using createBrowserRouter from routes.tsx in main.tsx');
  }
  
  console.log('\n=== Recommendation ===');
  console.log('You have two router configurations in your project:');
  console.log('1. BrowserRouter in App.tsx');
  console.log('2. createBrowserRouter in routes.tsx');
  console.log('\nThis can cause conflicts and "Invalid hook call" errors.');
  console.log('\nYou should choose ONE of these approaches:');
  console.log('Option 1: Use only the BrowserRouter in App.tsx and remove routes.tsx');
  console.log('Option 2: Use only the createBrowserRouter from routes.tsx and update App.tsx to use RouterProvider');
  
} catch (error) {
  console.error('Error analyzing router configuration:', error);
}
