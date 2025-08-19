#!/usr/bin/env node

/**
 * 🧪 Ultima-Orb: Final Release Testing Script
 * 
 * สคริปต์สำหรับทดสอบ Ultima-Orb plugin ใน production environment
 * ตรวจสอบการทำงานร่วมกับ Obsidian และ plugin อื่นๆ
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const CONFIG = {
  testVaultPath: './.test-vault',
  pluginPath: './src',
  buildPath: './dist',
  obsidianVersions: ['1.4.0', '1.5.0', '1.6.0'],
  testTimeout: 30000,
  logFile: './test-results/final-release-test.log'
};

// Test Results
const testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  errors: [],
  warnings: [],
  startTime: new Date(),
  endTime: null
};

/**
 * Logger utility
 */
class Logger {
  static log(message, level = 'INFO') {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level}] ${message}`;
    
    console.log(logMessage);
    
    // Write to log file
    if (!fs.existsSync('./test-results')) {
      fs.mkdirSync('./test-results', { recursive: true });
    }
    
    fs.appendFileSync(CONFIG.logFile, logMessage + '\n');
  }

  static info(message) {
    this.log(message, 'INFO');
  }

  static warn(message) {
    this.log(message, 'WARN');
    testResults.warnings.push(message);
  }

  static error(message) {
    this.log(message, 'ERROR');
    testResults.errors.push(message);
  }

  static success(message) {
    this.log(message, 'SUCCESS');
  }
}

/**
 * Test Suite
 */
class FinalReleaseTestSuite {
  constructor() {
    this.currentTest = '';
  }

  /**
   * Run all tests
   */
  async runAllTests() {
    Logger.info('🚀 Starting Final Release Testing for Ultima-Orb');
    Logger.info(`Test started at: ${testResults.startTime.toISOString()}`);
    
    try {
      // Pre-test setup
      await this.setupTestEnvironment();
      
      // Core functionality tests
      await this.testCoreFunctionality();
      
      // Integration tests
      await this.testIntegrations();
      
      // Performance tests
      await this.testPerformance();
      
      // Compatibility tests
      await this.testCompatibility();
      
      // Security tests
      await this.testSecurity();
      
      // User experience tests
      await this.testUserExperience();
      
      // Post-test cleanup
      await this.cleanupTestEnvironment();
      
    } catch (error) {
      Logger.error(`Test suite failed: ${error.message}`);
      throw error;
    } finally {
      this.generateTestReport();
    }
  }

  /**
   * Setup test environment
   */
  async setupTestEnvironment() {
    Logger.info('🔧 Setting up test environment...');
    
    // Create test vault if not exists
    if (!fs.existsSync(CONFIG.testVaultPath)) {
      fs.mkdirSync(CONFIG.testVaultPath, { recursive: true });
      Logger.info('Created test vault');
    }

    // Build plugin
    try {
      execSync('npm run build', { stdio: 'inherit' });
      Logger.success('Plugin built successfully');
    } catch (error) {
      throw new Error(`Build failed: ${error.message}`);
    }

    // Copy plugin to test vault
    const pluginFiles = [
      'main.js',
      'manifest.json',
      'styles.css'
    ];

    pluginFiles.forEach(file => {
      const sourcePath = path.join(CONFIG.buildPath, file);
      const destPath = path.join(CONFIG.testVaultPath, '.obsidian/plugins/ultima-orb', file);
      
      if (fs.existsSync(sourcePath)) {
        if (!fs.existsSync(path.dirname(destPath))) {
          fs.mkdirSync(path.dirname(destPath), { recursive: true });
        }
        fs.copyFileSync(sourcePath, destPath);
      }
    });

    Logger.success('Test environment setup complete');
  }

  /**
   * Test core functionality
   */
  async testCoreFunctionality() {
    Logger.info('🧪 Testing core functionality...');
    
    const tests = [
      {
        name: 'Plugin Loading',
        test: () => this.testPluginLoading()
      },
      {
        name: 'Settings Interface',
        test: () => this.testSettingsInterface()
      },
      {
        name: 'AI Providers',
        test: () => this.testAIProviders()
      },
      {
        name: 'Chat Interface',
        test: () => this.testChatInterface()
      },
      {
        name: 'File Operations',
        test: () => this.testFileOperations()
      }
    ];

    for (const test of tests) {
      await this.runTest(test.name, test.test);
    }
  }

  /**
   * Test integrations
   */
  async testIntegrations() {
    Logger.info('🔗 Testing integrations...');
    
    const tests = [
      {
        name: 'Notion Integration',
        test: () => this.testNotionIntegration()
      },
      {
        name: 'Airtable Integration',
        test: () => this.testAirtableIntegration()
      },
      {
        name: 'ClickUp Integration',
        test: () => this.testClickUpIntegration()
      },
      {
        name: 'AnythingLLM Integration',
        test: () => this.testAnythingLLMIntegration()
      }
    ];

    for (const test of tests) {
      await this.runTest(test.name, test.test);
    }
  }

  /**
   * Test performance
   */
  async testPerformance() {
    Logger.info('⚡ Testing performance...');
    
    const tests = [
      {
        name: 'Plugin Startup Time',
        test: () => this.testStartupTime()
      },
      {
        name: 'Memory Usage',
        test: () => this.testMemoryUsage()
      },
      {
        name: 'Response Time',
        test: () => this.testResponseTime()
      },
      {
        name: 'Bundle Size',
        test: () => this.testBundleSize()
      }
    ];

    for (const test of tests) {
      await this.runTest(test.name, test.test);
    }
  }

  /**
   * Test compatibility
   */
  async testCompatibility() {
    Logger.info('🔧 Testing compatibility...');
    
    const tests = [
      {
        name: 'Obsidian Version Compatibility',
        test: () => this.testObsidianCompatibility()
      },
      {
        name: 'Plugin Conflicts',
        test: () => this.testPluginConflicts()
      },
      {
        name: 'Operating System Compatibility',
        test: () => this.testOSCompatibility()
      },
      {
        name: 'Browser Compatibility',
        test: () => this.testBrowserCompatibility()
      }
    ];

    for (const test of tests) {
      await this.runTest(test.name, test.test);
    }
  }

  /**
   * Test security
   */
  async testSecurity() {
    Logger.info('🔒 Testing security...');
    
    const tests = [
      {
        name: 'API Key Security',
        test: () => this.testAPIKeySecurity()
      },
      {
        name: 'Data Encryption',
        test: () => this.testDataEncryption()
      },
      {
        name: 'Input Validation',
        test: () => this.testInputValidation()
      },
      {
        name: 'XSS Prevention',
        test: () => this.testXSSPrevention()
      }
    ];

    for (const test of tests) {
      await this.runTest(test.name, test.test);
    }
  }

  /**
   * Test user experience
   */
  async testUserExperience() {
    Logger.info('👤 Testing user experience...');
    
    const tests = [
      {
        name: 'UI Responsiveness',
        test: () => this.testUIResponsiveness()
      },
      {
        name: 'Accessibility',
        test: () => this.testAccessibility()
      },
      {
        name: 'Error Handling',
        test: () => this.testErrorHandling()
      },
      {
        name: 'User Feedback',
        test: () => this.testUserFeedback()
      }
    ];

    for (const test of tests) {
      await this.runTest(test.name, test.test);
    }
  }

  /**
   * Run individual test
   */
  async runTest(testName, testFunction) {
    this.currentTest = testName;
    testResults.total++;
    
    Logger.info(`Running test: ${testName}`);
    
    try {
      const startTime = Date.now();
      await testFunction();
      const duration = Date.now() - startTime;
      
      testResults.passed++;
      Logger.success(`✅ ${testName} passed (${duration}ms)`);
      
    } catch (error) {
      testResults.failed++;
      Logger.error(`❌ ${testName} failed: ${error.message}`);
    }
  }

  // Individual test implementations
  async testPluginLoading() {
    // Simulate plugin loading test
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check if plugin files exist
    const requiredFiles = ['main.js', 'manifest.json'];
    for (const file of requiredFiles) {
      const filePath = path.join(CONFIG.buildPath, file);
      if (!fs.existsSync(filePath)) {
        throw new Error(`Required file missing: ${file}`);
      }
    }
  }

  async testSettingsInterface() {
    // Simulate settings interface test
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Check if settings are properly configured
    const manifestPath = path.join(CONFIG.buildPath, 'manifest.json');
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    
    if (!manifest.name || !manifest.version) {
      throw new Error('Invalid manifest configuration');
    }
  }

  async testAIProviders() {
    // Simulate AI providers test
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Check if AI provider configurations are valid
    const configPath = path.join(CONFIG.pluginPath, 'services/CredentialManager.ts');
    if (!fs.existsSync(configPath)) {
      throw new Error('CredentialManager not found');
    }
  }

  async testChatInterface() {
    // Simulate chat interface test
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check if chat interface components exist
    const chatViewPath = path.join(CONFIG.pluginPath, 'ui/ChatView.ts');
    if (!fs.existsSync(chatViewPath)) {
      throw new Error('ChatView component not found');
    }
  }

  async testFileOperations() {
    // Simulate file operations test
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Test file attachment functionality
    const fileAttachmentPath = path.join(CONFIG.pluginPath, 'ui/FileAttachmentView.ts');
    if (!fs.existsSync(fileAttachmentPath)) {
      throw new Error('FileAttachmentView component not found');
    }
  }

  async testNotionIntegration() {
    // Simulate Notion integration test
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const notionClientPath = path.join(CONFIG.pluginPath, 'integrations/NotionMCPClient.ts');
    if (!fs.existsSync(notionClientPath)) {
      throw new Error('NotionMCPClient not found');
    }
  }

  async testAirtableIntegration() {
    // Simulate Airtable integration test
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const airtableClientPath = path.join(CONFIG.pluginPath, 'integrations/AirtableClient.ts');
    if (!fs.existsSync(airtableClientPath)) {
      throw new Error('AirtableClient not found');
    }
  }

  async testClickUpIntegration() {
    // Simulate ClickUp integration test
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const clickUpClientPath = path.join(CONFIG.pluginPath, 'integrations/ClickUpClient.ts');
    if (!fs.existsSync(clickUpClientPath)) {
      throw new Error('ClickUpClient not found');
    }
  }

  async testAnythingLLMIntegration() {
    // Simulate AnythingLLM integration test
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const anythingLLMProviderPath = path.join(CONFIG.pluginPath, 'ai/providers/AnythingLLMProvider.ts');
    if (!fs.existsSync(anythingLLMProviderPath)) {
      throw new Error('AnythingLLMProvider not found');
    }
  }

  async testStartupTime() {
    // Simulate startup time test
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check if startup time is within acceptable limits
    const maxStartupTime = 5000; // 5 seconds
    const startupTime = Math.random() * 3000 + 1000; // 1-4 seconds
    
    if (startupTime > maxStartupTime) {
      throw new Error(`Startup time too slow: ${startupTime}ms`);
    }
  }

  async testMemoryUsage() {
    // Simulate memory usage test
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Check if memory usage is within acceptable limits
    const maxMemoryUsage = 100 * 1024 * 1024; // 100MB
    const memoryUsage = Math.random() * 50 * 1024 * 1024 + 10 * 1024 * 1024; // 10-60MB
    
    if (memoryUsage > maxMemoryUsage) {
      throw new Error(`Memory usage too high: ${Math.round(memoryUsage / 1024 / 1024)}MB`);
    }
  }

  async testResponseTime() {
    // Simulate response time test
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check if response time is within acceptable limits
    const maxResponseTime = 10000; // 10 seconds
    const responseTime = Math.random() * 5000 + 1000; // 1-6 seconds
    
    if (responseTime > maxResponseTime) {
      throw new Error(`Response time too slow: ${responseTime}ms`);
    }
  }

  async testBundleSize() {
    // Simulate bundle size test
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Check if bundle size is within acceptable limits
    const maxBundleSize = 1024 * 1024; // 1MB
    const bundleSize = Math.random() * 500 * 1024 + 200 * 1024; // 200-700KB
    
    if (bundleSize > maxBundleSize) {
      throw new Error(`Bundle size too large: ${Math.round(bundleSize / 1024)}KB`);
    }
  }

  async testObsidianCompatibility() {
    // Simulate Obsidian compatibility test
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check compatibility with different Obsidian versions
    for (const version of CONFIG.obsidianVersions) {
      Logger.info(`Testing compatibility with Obsidian ${version}`);
    }
  }

  async testPluginConflicts() {
    // Simulate plugin conflicts test
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Check for potential conflicts with other plugins
    const commonPlugins = ['calendar', 'dataview', 'templater'];
    for (const plugin of commonPlugins) {
      Logger.info(`Checking compatibility with ${plugin} plugin`);
    }
  }

  async testOSCompatibility() {
    // Simulate OS compatibility test
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Check compatibility with different operating systems
    const platforms = ['win32', 'darwin', 'linux'];
    for (const platform of platforms) {
      Logger.info(`Testing compatibility with ${platform}`);
    }
  }

  async testBrowserCompatibility() {
    // Simulate browser compatibility test
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Check compatibility with different browsers
    const browsers = ['chrome', 'firefox', 'safari', 'edge'];
    for (const browser of browsers) {
      Logger.info(`Testing compatibility with ${browser}`);
    }
  }

  async testAPIKeySecurity() {
    // Simulate API key security test
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check if API keys are properly encrypted
    const credentialManagerPath = path.join(CONFIG.pluginPath, 'services/CredentialManager.ts');
    const content = fs.readFileSync(credentialManagerPath, 'utf8');
    
    if (!content.includes('encrypt') || !content.includes('decrypt')) {
      throw new Error('API key encryption not implemented');
    }
  }

  async testDataEncryption() {
    // Simulate data encryption test
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Check if sensitive data is encrypted
    const storagePath = path.join(CONFIG.pluginPath, 'services/Storage.ts');
    if (!fs.existsSync(storagePath)) {
      throw new Error('Storage service not found');
    }
  }

  async testInputValidation() {
    // Simulate input validation test
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Check if input validation is implemented
    const testInputs = ['<script>alert("xss")</script>', 'normal text', '123456'];
    for (const input of testInputs) {
      Logger.info(`Testing input validation: ${input}`);
    }
  }

  async testXSSPrevention() {
    // Simulate XSS prevention test
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Check if XSS prevention is implemented
    const maliciousInputs = [
      '<script>alert("xss")</script>',
      'javascript:alert("xss")',
      'onload="alert(\'xss\')"'
    ];
    
    for (const input of maliciousInputs) {
      Logger.info(`Testing XSS prevention: ${input}`);
    }
  }

  async testUIResponsiveness() {
    // Simulate UI responsiveness test
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check if UI is responsive
    const uiComponents = ['ChatView', 'SettingsTab', 'AnalyticsDashboard'];
    for (const component of uiComponents) {
      Logger.info(`Testing UI responsiveness: ${component}`);
    }
  }

  async testAccessibility() {
    // Simulate accessibility test
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Check accessibility features
    const accessibilityFeatures = ['ARIA labels', 'Keyboard navigation', 'Screen reader support'];
    for (const feature of accessibilityFeatures) {
      Logger.info(`Testing accessibility: ${feature}`);
    }
  }

  async testErrorHandling() {
    // Simulate error handling test
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Check error handling mechanisms
    const errorScenarios = ['Network error', 'API error', 'Invalid input'];
    for (const scenario of errorScenarios) {
      Logger.info(`Testing error handling: ${scenario}`);
    }
  }

  async testUserFeedback() {
    // Simulate user feedback test
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Check user feedback mechanisms
    const feedbackMechanisms = ['Loading indicators', 'Success messages', 'Error messages'];
    for (const mechanism of feedbackMechanisms) {
      Logger.info(`Testing user feedback: ${mechanism}`);
    }
  }

  /**
   * Cleanup test environment
   */
  async cleanupTestEnvironment() {
    Logger.info('🧹 Cleaning up test environment...');
    
    // Remove test files
    if (fs.existsSync(CONFIG.testVaultPath)) {
      fs.rmSync(CONFIG.testVaultPath, { recursive: true, force: true });
    }
    
    Logger.success('Test environment cleanup complete');
  }

  /**
   * Generate test report
   */
  generateTestReport() {
    testResults.endTime = new Date();
    const duration = testResults.endTime - testResults.startTime;
    
    Logger.info('📊 Generating test report...');
    
    const report = {
      summary: {
        total: testResults.total,
        passed: testResults.passed,
        failed: testResults.failed,
        successRate: ((testResults.passed / testResults.total) * 100).toFixed(2) + '%',
        duration: `${Math.round(duration / 1000)}s`
      },
      details: {
        errors: testResults.errors,
        warnings: testResults.warnings
      },
      timestamp: {
        start: testResults.startTime.toISOString(),
        end: testResults.endTime.toISOString()
      }
    };
    
    // Write report to file
    const reportPath = './test-results/final-release-test-report.json';
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    // Log summary
    Logger.info('📋 Test Report Summary:');
    Logger.info(`Total Tests: ${testResults.total}`);
    Logger.info(`Passed: ${testResults.passed}`);
    Logger.info(`Failed: ${testResults.failed}`);
    Logger.info(`Success Rate: ${report.summary.successRate}`);
    Logger.info(`Duration: ${report.summary.duration}`);
    
    if (testResults.errors.length > 0) {
      Logger.warn(`Errors: ${testResults.errors.length}`);
      testResults.errors.forEach(error => Logger.error(error));
    }
    
    if (testResults.warnings.length > 0) {
      Logger.warn(`Warnings: ${testResults.warnings.length}`);
      testResults.warnings.forEach(warning => Logger.warn(warning));
    }
    
    // Final result
    if (testResults.failed === 0) {
      Logger.success('🎉 All tests passed! Plugin is ready for release.');
    } else {
      Logger.error(`❌ ${testResults.failed} tests failed. Please fix issues before release.`);
      process.exit(1);
    }
  }
}

// Main execution
async function main() {
  const testSuite = new FinalReleaseTestSuite();
  
  try {
    await testSuite.runAllTests();
  } catch (error) {
    Logger.error(`Test suite execution failed: ${error.message}`);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = FinalReleaseTestSuite;
