#!/usr/bin/env node

/**
 * 🔮 Ultima-Orb: Test Automation Script
 * รัน test ทั้งหมดพร้อมรายงานความคืบหน้า
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logHeader(message) {
  log('\n' + '='.repeat(60), 'cyan');
  log(`🔮 ${message}`, 'bright');
  log('='.repeat(60), 'cyan');
}

function logSection(message) {
  log('\n' + '-'.repeat(40), 'yellow');
  log(`📋 ${message}`, 'yellow');
  log('-'.repeat(40), 'yellow');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

// Check if we're in the right directory
function checkProjectStructure() {
  logSection('Checking Project Structure');
  
  const requiredFiles = [
    'package.json',
    'tsconfig.json',
    'vitest.config.mjs',
    'src/main.ts',
    'test/setup.ts'
  ];
  
  const missingFiles = requiredFiles.filter(file => !fs.existsSync(file));
  
  if (missingFiles.length > 0) {
    logError(`Missing required files: ${missingFiles.join(', ')}`);
    process.exit(1);
  }
  
  logSuccess('Project structure is valid');
}

// Run linting
function runLint() {
  logSection('Running ESLint');
  
  try {
    execSync('npm run lint', { stdio: 'inherit' });
    logSuccess('ESLint passed');
    return true;
  } catch (error) {
    logError('ESLint failed');
    return false;
  }
}

// Run TypeScript type checking
function runTypeCheck() {
  logSection('Running TypeScript Type Check');
  
  try {
    execSync('npx tsc --noEmit', { stdio: 'inherit' });
    logSuccess('TypeScript type check passed');
    return true;
  } catch (error) {
    logError('TypeScript type check failed');
    return false;
  }
}

// Run tests
function runTests() {
  logSection('Running Tests');
  
  try {
    execSync('npm test', { stdio: 'inherit' });
    logSuccess('All tests passed');
    return true;
  } catch (error) {
    logError('Some tests failed');
    return false;
  }
}

// Run build
function runBuild() {
  logSection('Running Build');
  
  try {
    execSync('npm run build', { stdio: 'inherit' });
    logSuccess('Build completed successfully');
    return true;
  } catch (error) {
    logError('Build failed');
    return false;
  }
}

// Generate test report
function generateTestReport() {
  logSection('Generating Test Report');
  
  try {
    execSync('npm run test:coverage', { stdio: 'inherit' });
    logSuccess('Test coverage report generated');
    return true;
  } catch (error) {
    logWarning('Could not generate coverage report');
    return false;
  }
}

// Main execution
function main() {
  logHeader('Ultima-Orb Test Automation');
  
  const startTime = Date.now();
  const results = {
    structure: false,
    lint: false,
    typeCheck: false,
    tests: false,
    build: false,
    coverage: false
  };
  
  try {
    // Check project structure
    checkProjectStructure();
    results.structure = true;
    
    // Run linting
    results.lint = runLint();
    
    // Run type checking
    results.typeCheck = runTypeCheck();
    
    // Run tests
    results.tests = runTests();
    
    // Run build
    results.build = runBuild();
    
    // Generate coverage report
    results.coverage = generateTestReport();
    
  } catch (error) {
    logError(`Unexpected error: ${error.message}`);
  }
  
  // Summary
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);
  
  logHeader('Test Summary');
  
  const passed = Object.values(results).filter(Boolean).length;
  const total = Object.keys(results).length;
  
  log(`Duration: ${duration}s`, 'cyan');
  log(`Passed: ${passed}/${total}`, passed === total ? 'green' : 'yellow');
  
  Object.entries(results).forEach(([key, passed]) => {
    const status = passed ? '✅' : '❌';
    const color = passed ? 'green' : 'red';
    log(`${status} ${key}: ${passed ? 'PASSED' : 'FAILED'}`, color);
  });
  
  if (passed === total) {
    log('\n🎉 All checks passed! Project is ready for development.', 'green');
  } else {
    log('\n⚠️  Some checks failed. Please fix the issues above.', 'yellow');
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  checkProjectStructure,
  runLint,
  runTypeCheck,
  runTests,
  runBuild,
  generateTestReport
};
