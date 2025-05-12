// Script to help identify and fix React hooks issues
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to check if a file exists
function fileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch (err) {
    return false;
  }
}

// Function to read a file
function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (err) {
    console.error(`Error reading file ${filePath}:`, err);
    return null;
  }
}

// Function to write to a file
function writeFile(filePath, content) {
  try {
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  } catch (err) {
    console.error(`Error writing to file ${filePath}:`, err);
    return false;
  }
}

// Check for duplicate React instances in package.json
function checkPackageJson() {
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  if (!fileExists(packageJsonPath)) {
    console.error('package.json not found');
    return;
  }

  const packageJson = JSON.parse(readFile(packageJsonPath));
  const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };

  console.log('\n=== Checking for React dependencies ===');
  console.log('React version:', dependencies.react);
  console.log('React DOM version:', dependencies['react-dom']);

  // Check for potential duplicate React packages
  const reactRelatedPackages = Object.keys(dependencies).filter(pkg =>
    pkg.includes('react') || pkg.includes('React')
  );

  console.log('\nAll React-related packages:');
  reactRelatedPackages.forEach(pkg => {
    console.log(`- ${pkg}: ${dependencies[pkg]}`);
  });
}

// Check for multiple Router instances
function checkRouterInstances() {
  const appTsxPath = path.join(process.cwd(), 'src', 'App.tsx');
  const mainTsxPath = path.join(process.cwd(), 'src', 'main.tsx');
  const _appTsxPath = path.join(process.cwd(), 'src', 'pages', '_app.tsx');

  console.log('\n=== Checking for Router instances ===');

  if (fileExists(appTsxPath)) {
    const appTsxContent = readFile(appTsxPath);
    const hasRouter = appTsxContent.includes('<Router') || appTsxContent.includes('BrowserRouter');
    console.log(`App.tsx has Router: ${hasRouter}`);
  }

  if (fileExists(mainTsxPath)) {
    const mainTsxContent = readFile(mainTsxPath);
    const hasRouter = mainTsxContent.includes('<Router') || mainTsxContent.includes('BrowserRouter');
    console.log(`main.tsx has Router: ${hasRouter}`);
  }

  if (fileExists(_appTsxPath)) {
    const _appTsxContent = readFile(_appTsxPath);
    const hasRouter = _appTsxContent.includes('<Router') || _appTsxContent.includes('BrowserRouter');
    console.log(`_app.tsx has Router: ${hasRouter}`);
  }
}

// Check for multiple ThemeProvider instances
function checkThemeProviderInstances() {
  const appTsxPath = path.join(process.cwd(), 'src', 'App.tsx');
  const mainTsxPath = path.join(process.cwd(), 'src', 'main.tsx');
  const _appTsxPath = path.join(process.cwd(), 'src', 'pages', '_app.tsx');

  console.log('\n=== Checking for ThemeProvider instances ===');

  if (fileExists(appTsxPath)) {
    const appTsxContent = readFile(appTsxPath);
    const hasThemeProvider = appTsxContent.includes('<ThemeProvider');
    console.log(`App.tsx has ThemeProvider: ${hasThemeProvider}`);
  }

  if (fileExists(mainTsxPath)) {
    const mainTsxContent = readFile(mainTsxPath);
    const hasThemeProvider = mainTsxContent.includes('<ThemeProvider');
    console.log(`main.tsx has ThemeProvider: ${hasThemeProvider}`);
  }

  if (fileExists(_appTsxPath)) {
    const _appTsxContent = readFile(_appTsxPath);
    const hasThemeProvider = _appTsxContent.includes('<ThemeProvider');
    console.log(`_app.tsx has ThemeProvider: ${hasThemeProvider}`);
  }
}

// Main function
function main() {
  console.log('=== React Hooks Issue Checker ===');
  checkPackageJson();
  checkRouterInstances();
  checkThemeProviderInstances();

  console.log('\n=== Recommendations ===');
  console.log('1. Ensure you have only one Router instance in your application');
  console.log('2. Ensure you have only one ThemeProvider instance in your application');
  console.log('3. Check for duplicate React installations');
  console.log('4. Make sure all hooks are called inside function components');
  console.log('5. Run "npm dedupe" to remove duplicate dependencies');
}

main();
