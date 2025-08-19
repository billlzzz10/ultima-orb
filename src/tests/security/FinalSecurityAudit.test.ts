import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { CredentialManager } from '../../services/CredentialManager';
import { StorageManager } from '../../services/StorageManager';
import { AIOrchestrator } from '../../ai/AIOrchestrator';
import { ChatView } from '../../ui/ChatView';
import { UltimaOrbPlugin } from '../../main';

/**
 * 🛡️ Ultima-Orb: Final Security Audit Test Suite
 * การทดสอบความปลอดภัยขั้นสุดท้ายก่อนการปล่อยเวอร์ชัน
 * ตรวจสอบทุกด้านของความปลอดภัยในระบบ
 */

describe('Ultima-Orb Final Security Audit', () => {
  let plugin: UltimaOrbPlugin;
  let credentialManager: CredentialManager;
  let storageManager: StorageManager;
  let aiOrchestrator: AIOrchestrator;
  let chatView: ChatView;

  beforeEach(() => {
    // Mock Obsidian API
    global.app = {
      vault: {
        adapter: {
          getResourcePath: vi.fn(),
          getFullPath: vi.fn(),
        },
      },
      workspace: {
        onLayoutReady: vi.fn(),
      },
    } as any;

    // Initialize components
    plugin = new UltimaOrbPlugin();
    credentialManager = new CredentialManager();
    storageManager = new StorageManager();
    aiOrchestrator = new AIOrchestrator();
    chatView = new ChatView(plugin);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('🔐 Credential Security', () => {
    it('should encrypt sensitive data before storage', async () => {
      const testCredentials = {
        openai: 'sk-test-key-12345',
        anthropic: 'sk-ant-test-key-67890',
        gemini: 'AIza-test-key-abcdef',
      };

      // Test encryption
      await credentialManager.storeCredentials('openai', testCredentials.openai);
      await credentialManager.storeCredentials('anthropic', testCredentials.anthropic);
      await credentialManager.storeCredentials('gemini', testCredentials.gemini);

      // Verify encrypted storage
      const storedData = await storageManager.getData('credentials');
      expect(storedData).toBeDefined();
      expect(storedData.openai).not.toBe(testCredentials.openai);
      expect(storedData.anthropic).not.toBe(testCredentials.anthropic);
      expect(storedData.gemini).not.toBe(testCredentials.gemini);
    });

    it('should decrypt credentials correctly when retrieved', async () => {
      const testKey = 'sk-test-key-12345';
      await credentialManager.storeCredentials('openai', testKey);
      
      const retrievedKey = await credentialManager.getCredentials('openai');
      expect(retrievedKey).toBe(testKey);
    });

    it('should not expose credentials in logs', async () => {
      const consoleSpy = vi.spyOn(console, 'log');
      const testKey = 'sk-test-key-12345';
      
      await credentialManager.storeCredentials('openai', testKey);
      
      expect(consoleSpy).not.toHaveBeenCalledWith(
        expect.stringContaining(testKey)
      );
    });

    it('should securely clear credentials on logout', async () => {
      const testKey = 'sk-test-key-12345';
      await credentialManager.storeCredentials('openai', testKey);
      
      await credentialManager.clearCredentials();
      
      const retrievedKey = await credentialManager.getCredentials('openai');
      expect(retrievedKey).toBeNull();
    });
  });

  describe('🛡️ Input Validation & Sanitization', () => {
    it('should sanitize user inputs to prevent XSS', () => {
      const maliciousInputs = [
        '<script>alert("xss")</script>',
        'javascript:alert("xss")',
        '<img src="x" onerror="alert(\'xss\')">',
        '"><script>alert("xss")</script>',
      ];

      maliciousInputs.forEach(input => {
        const sanitized = chatView.sanitizeInput(input);
        expect(sanitized).not.toContain('<script>');
        expect(sanitized).not.toContain('javascript:');
        expect(sanitized).not.toContain('onerror=');
      });
    });

    it('should validate API endpoints', () => {
      const validEndpoints = [
        'https://api.openai.com/v1/chat/completions',
        'https://api.anthropic.com/v1/messages',
        'https://generativelanguage.googleapis.com/v1beta/models',
      ];

      const invalidEndpoints = [
        'http://malicious-site.com/api',
        'ftp://insecure-server.com/data',
        'file:///etc/passwd',
      ];

      validEndpoints.forEach(endpoint => {
        expect(aiOrchestrator.validateEndpoint(endpoint)).toBe(true);
      });

      invalidEndpoints.forEach(endpoint => {
        expect(aiOrchestrator.validateEndpoint(endpoint)).toBe(false);
      });
    });

    it('should prevent SQL injection in storage queries', async () => {
      const maliciousQueries = [
        "'; DROP TABLE users; --",
        "' OR '1'='1",
        "'; INSERT INTO users VALUES ('hacker', 'password'); --",
      ];

      for (const query of maliciousQueries) {
        await expect(
          storageManager.queryData(query)
        ).rejects.toThrow('Invalid query');
      }
    });

    it('should validate file uploads', () => {
      const validFiles = [
        { name: 'document.pdf', type: 'application/pdf', size: 1024 },
        { name: 'image.jpg', type: 'image/jpeg', size: 2048 },
        { name: 'text.txt', type: 'text/plain', size: 512 },
      ];

      const invalidFiles = [
        { name: 'script.exe', type: 'application/x-msdownload', size: 1024 },
        { name: 'virus.bat', type: 'application/x-msdos-program', size: 512 },
        { name: 'malware.sh', type: 'application/x-sh', size: 256 },
      ];

      validFiles.forEach(file => {
        expect(chatView.validateFileUpload(file)).toBe(true);
      });

      invalidFiles.forEach(file => {
        expect(chatView.validateFileUpload(file)).toBe(false);
      });
    });
  });

  describe('🔒 Authentication & Authorization', () => {
    it('should require authentication for sensitive operations', async () => {
      const sensitiveOperations = [
        'getCredentials',
        'storeCredentials',
        'clearCredentials',
        'exportData',
        'importData',
      ];

      for (const operation of sensitiveOperations) {
        await expect(
          credentialManager[operation]()
        ).rejects.toThrow('Authentication required');
      }
    });

    it('should implement proper session management', async () => {
      // Test session creation
      const session = await credentialManager.createSession('user123');
      expect(session).toBeDefined();
      expect(session.userId).toBe('user123');
      expect(session.expiresAt).toBeGreaterThan(Date.now());

      // Test session validation
      const isValid = await credentialManager.validateSession(session.token);
      expect(isValid).toBe(true);

      // Test session expiration
      const expiredSession = { ...session, expiresAt: Date.now() - 1000 };
      const isExpired = await credentialManager.validateSession(expiredSession.token);
      expect(isExpired).toBe(false);
    });

    it('should implement rate limiting', async () => {
      const rateLimiter = credentialManager.getRateLimiter();
      
      // Test normal usage
      for (let i = 0; i < 10; i++) {
        expect(rateLimiter.checkLimit('user123')).toBe(true);
      }

      // Test rate limit exceeded
      expect(rateLimiter.checkLimit('user123')).toBe(false);
    });
  });

  describe('🔐 Data Protection', () => {
    it('should encrypt data at rest', async () => {
      const sensitiveData = {
        apiKeys: { openai: 'sk-test-123' },
        userPreferences: { theme: 'dark' },
        chatHistory: [{ message: 'Hello', timestamp: Date.now() }],
      };

      await storageManager.storeData('user_data', sensitiveData);
      
      // Verify data is encrypted in storage
      const rawStorage = await storageManager.getRawStorage();
      expect(rawStorage.user_data).not.toEqual(sensitiveData);
      expect(typeof rawStorage.user_data).toBe('string');
    });

    it('should implement secure data transmission', async () => {
      const testData = { message: 'Hello World' };
      
      const transmission = await aiOrchestrator.secureTransmission(testData);
      
      expect(transmission.encrypted).toBe(true);
      expect(transmission.checksum).toBeDefined();
      expect(transmission.timestamp).toBeDefined();
    });

    it('should securely handle data deletion', async () => {
      const testData = { sensitive: 'data' };
      await storageManager.storeData('test', testData);
      
      await storageManager.secureDelete('test');
      
      // Verify data is completely removed
      const retrieved = await storageManager.getData('test');
      expect(retrieved).toBeNull();
      
      // Verify no traces in logs
      const logs = await storageManager.getAuditLogs();
      expect(logs).not.toContain('sensitive');
    });
  });

  describe('🌐 API Security', () => {
    it('should validate API responses', async () => {
      const mockResponse = {
        status: 200,
        data: { message: 'Hello World' },
        headers: { 'content-type': 'application/json' },
      };

      const validated = await aiOrchestrator.validateApiResponse(mockResponse);
      expect(validated).toBe(true);
    });

    it('should handle API errors securely', async () => {
      const errorResponses = [
        { status: 401, message: 'Unauthorized' },
        { status: 403, message: 'Forbidden' },
        { status: 429, message: 'Rate Limited' },
        { status: 500, message: 'Internal Server Error' },
      ];

      for (const error of errorResponses) {
        await expect(
          aiOrchestrator.handleApiError(error)
        ).rejects.toThrow();
      }
    });

    it('should implement request signing', async () => {
      const request = {
        method: 'POST',
        url: 'https://api.openai.com/v1/chat/completions',
        data: { message: 'Hello' },
      };

      const signedRequest = await aiOrchestrator.signRequest(request);
      
      expect(signedRequest.headers).toBeDefined();
      expect(signedRequest.headers['X-Signature']).toBeDefined();
      expect(signedRequest.headers['X-Timestamp']).toBeDefined();
    });
  });

  describe('🔍 Session Security', () => {
    it('should implement secure session tokens', async () => {
      const token = await credentialManager.generateSessionToken();
      
      expect(token).toMatch(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/);
      expect(token.length).toBeGreaterThan(100);
    });

    it('should validate session tokens', async () => {
      const validToken = await credentialManager.generateSessionToken();
      const invalidToken = 'invalid.token.here';
      
      expect(await credentialManager.validateSessionToken(validToken)).toBe(true);
      expect(await credentialManager.validateSessionToken(invalidToken)).toBe(false);
    });

    it('should implement session timeout', async () => {
      const session = await credentialManager.createSession('user123', 1000); // 1 second timeout
      
      expect(await credentialManager.validateSession(session.token)).toBe(true);
      
      // Wait for timeout
      await new Promise(resolve => setTimeout(resolve, 1100));
      
      expect(await credentialManager.validateSession(session.token)).toBe(false);
    });
  });

  describe('🚨 Error Handling Security', () => {
    it('should not expose sensitive information in error messages', async () => {
      const sensitiveErrors = [
        new Error('API Key: sk-test-123 is invalid'),
        new Error('Database password: secret123 failed'),
        new Error('User token: abc123.def456.ghi789 expired'),
      ];

      for (const error of sensitiveErrors) {
        const sanitizedError = credentialManager.sanitizeError(error);
        expect(sanitizedError.message).not.toContain('sk-test-123');
        expect(sanitizedError.message).not.toContain('secret123');
        expect(sanitizedError.message).not.toContain('abc123.def456.ghi789');
      }
    });

    it('should log security events', async () => {
      const securityEvents = [
        { type: 'failed_login', user: 'user123', ip: '192.168.1.1' },
        { type: 'api_key_exposed', service: 'openai', timestamp: Date.now() },
        { type: 'suspicious_activity', details: 'Multiple failed attempts' },
      ];

      for (const event of securityEvents) {
        await credentialManager.logSecurityEvent(event);
      }

      const logs = await credentialManager.getSecurityLogs();
      expect(logs).toHaveLength(securityEvents.length);
    });
  });

  describe('📋 Compliance & Standards', () => {
    it('should comply with GDPR requirements', async () => {
      const gdprCompliance = await plugin.checkGDPRCompliance();
      
      expect(gdprCompliance.dataMinimization).toBe(true);
      expect(gdprCompliance.userConsent).toBe(true);
      expect(gdprCompliance.dataPortability).toBe(true);
      expect(gdprCompliance.rightToErasure).toBe(true);
    });

    it('should implement audit logging', async () => {
      const auditEvents = [
        { action: 'login', user: 'user123', timestamp: Date.now() },
        { action: 'api_call', service: 'openai', timestamp: Date.now() },
        { action: 'data_export', user: 'user123', timestamp: Date.now() },
      ];

      for (const event of auditEvents) {
        await plugin.logAuditEvent(event);
      }

      const auditLog = await plugin.getAuditLog();
      expect(auditLog).toHaveLength(auditEvents.length);
    });

    it('should implement data retention policies', async () => {
      const retentionPolicies = {
        chatHistory: 30 * 24 * 60 * 60 * 1000, // 30 days
        auditLogs: 90 * 24 * 60 * 60 * 1000,   // 90 days
        tempFiles: 7 * 24 * 60 * 60 * 1000,    // 7 days
      };

      const compliance = await plugin.checkRetentionCompliance(retentionPolicies);
      expect(compliance.compliant).toBe(true);
    });
  });

  describe('🔧 Security Configuration', () => {
    it('should validate security settings', async () => {
      const securityConfig = {
        encryptionEnabled: true,
        sessionTimeout: 3600000, // 1 hour
        maxLoginAttempts: 5,
        requireMFA: false,
        allowedFileTypes: ['pdf', 'jpg', 'png', 'txt'],
        maxFileSize: 10 * 1024 * 1024, // 10MB
      };

      const validation = await plugin.validateSecurityConfig(securityConfig);
      expect(validation.valid).toBe(true);
    });

    it('should enforce security policies', async () => {
      const policies = [
        'require_strong_passwords',
        'enable_encryption',
        'log_security_events',
        'validate_inputs',
        'rate_limit_requests',
      ];

      for (const policy of policies) {
        expect(await plugin.enforceSecurityPolicy(policy)).toBe(true);
      }
    });
  });

  describe('🧪 Penetration Testing', () => {
    it('should resist common attack vectors', async () => {
      const attackVectors = [
        { type: 'sql_injection', payload: "'; DROP TABLE users; --" },
        { type: 'xss', payload: '<script>alert("xss")</script>' },
        { type: 'csrf', payload: '<img src="x" onerror="fetch(\'/api/delete\')">' },
        { type: 'path_traversal', payload: '../../../etc/passwd' },
      ];

      for (const attack of attackVectors) {
        const result = await plugin.testSecurityVulnerability(attack);
        expect(result.vulnerable).toBe(false);
      }
    });

    it('should handle edge cases securely', async () => {
      const edgeCases = [
        { input: '', expected: 'empty_input_handled' },
        { input: null, expected: 'null_input_handled' },
        { input: undefined, expected: 'undefined_input_handled' },
        { input: 'a'.repeat(10000), expected: 'large_input_handled' },
      ];

      for (const edgeCase of edgeCases) {
        const result = await plugin.handleEdgeCase(edgeCase.input);
        expect(result.status).toBe(edgeCase.expected);
      }
    });
  });

  describe('📊 Security Metrics', () => {
    it('should track security metrics', async () => {
      const metrics = await plugin.getSecurityMetrics();
      
      expect(metrics.failedLoginAttempts).toBeDefined();
      expect(metrics.successfulLogins).toBeDefined();
      expect(metrics.securityEvents).toBeDefined();
      expect(metrics.vulnerabilityScans).toBeDefined();
      expect(metrics.complianceScore).toBeDefined();
    });

    it('should generate security reports', async () => {
      const report = await plugin.generateSecurityReport();
      
      expect(report.timestamp).toBeDefined();
      expect(report.summary).toBeDefined();
      expect(report.vulnerabilities).toBeDefined();
      expect(report.recommendations).toBeDefined();
      expect(report.complianceStatus).toBeDefined();
    });
  });

  describe('🎯 Final Security Assessment', () => {
    it('should pass comprehensive security audit', async () => {
      const auditResults = await plugin.performSecurityAudit();
      
      expect(auditResults.overallScore).toBeGreaterThanOrEqual(90);
      expect(auditResults.criticalIssues).toBe(0);
      expect(auditResults.highIssues).toBeLessThanOrEqual(2);
      expect(auditResults.mediumIssues).toBeLessThanOrEqual(5);
      expect(auditResults.lowIssues).toBeLessThanOrEqual(10);
    });

    it('should meet security requirements for production', async () => {
      const requirements = [
        'encryption_at_rest',
        'encryption_in_transit',
        'input_validation',
        'authentication',
        'authorization',
        'audit_logging',
        'error_handling',
        'session_management',
      ];

      const compliance = await plugin.checkProductionReadiness(requirements);
      expect(compliance.ready).toBe(true);
      expect(compliance.missingRequirements).toHaveLength(0);
    });
  });
});
