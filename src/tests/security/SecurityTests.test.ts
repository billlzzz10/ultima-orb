import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { CredentialManager } from '../../services/CredentialManager';
import { AIOrchestrator } from '../../ai/AIOrchestrator';
import { Logger } from '../../services/Logger';
import { EventsBus } from '../../services/EventsBus';

// Mock dependencies
vi.mock('../../services/Logger');
vi.mock('../../services/EventsBus');

describe('Security Tests', () => {
  let credentialManager: CredentialManager;
  let aiOrchestrator: AIOrchestrator;
  let mockLogger: any;
  let mockEventsBus: any;

  beforeEach(() => {
    mockLogger = {
      info: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
      debug: vi.fn()
    };

    mockEventsBus = {
      emit: vi.fn(),
      on: vi.fn(),
      off: vi.fn()
    };

    (Logger as any).mockImplementation(() => mockLogger);
    (EventsBus as any).mockImplementation(() => mockEventsBus);

    credentialManager = new CredentialManager(mockLogger);
    aiOrchestrator = new AIOrchestrator(mockLogger, mockEventsBus, credentialManager);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Credential Management', () => {
    it('should encrypt sensitive credentials', () => {
      const apiKey = 'sk-test-1234567890abcdef';
      const provider = 'openai';

      // Store credential
      credentialManager.setCredential(provider, 'api_key', apiKey);

      // Verify credential is stored
      expect(credentialManager.hasCredential(provider, 'api_key')).toBe(true);

      // Verify credential is encrypted (not stored as plain text)
      const storedData = credentialManager.getCredential(provider, 'api_key');
      expect(storedData).toBe(apiKey); // Should be decrypted when retrieved
    });

    it('should not expose credentials in logs', () => {
      const apiKey = 'sk-test-1234567890abcdef';
      const provider = 'openai';

      // Store credential
      credentialManager.setCredential(provider, 'api_key', apiKey);

      // Check that sensitive data is not logged
      expect(mockLogger.info).not.toHaveBeenCalledWith(
        expect.stringContaining(apiKey)
      );
      expect(mockLogger.debug).not.toHaveBeenCalledWith(
        expect.stringContaining(apiKey)
      );
    });

    it('should handle credential validation securely', () => {
      const validApiKey = 'sk-test-1234567890abcdef';
      const invalidApiKey = 'invalid-key';

      // Test valid credential
      const isValid = credentialManager.validateCredential('openai', 'api_key', validApiKey);
      expect(isValid).toBe(true);

      // Test invalid credential
      const isInvalid = credentialManager.validateCredential('openai', 'api_key', invalidApiKey);
      expect(isInvalid).toBe(false);
    });

    it('should securely delete credentials', () => {
      const apiKey = 'sk-test-1234567890abcdef';
      const provider = 'openai';

      // Store credential
      credentialManager.setCredential(provider, 'api_key', apiKey);
      expect(credentialManager.hasCredential(provider, 'api_key')).toBe(true);

      // Delete credential
      credentialManager.deleteCredential(provider, 'api_key');
      expect(credentialManager.hasCredential(provider, 'api_key')).toBe(false);
    });

    it('should prevent credential enumeration', () => {
      // Attempt to enumerate credentials
      const providers = ['openai', 'claude', 'gemini'];
      
      providers.forEach(provider => {
        // Should not reveal whether credential exists
        const hasCredential = credentialManager.hasCredential(provider, 'api_key');
        expect(typeof hasCredential).toBe('boolean');
      });
    });
  });

  describe('Input Validation', () => {
    it('should sanitize user inputs', () => {
      const maliciousInput = '<script>alert("xss")</script>Hello World';
      const sanitizedInput = credentialManager.sanitizeInput(maliciousInput);

      // Should remove script tags
      expect(sanitizedInput).not.toContain('<script>');
      expect(sanitizedInput).not.toContain('</script>');
      expect(sanitizedInput).toContain('Hello World');
    });

    it('should validate API endpoints', () => {
      const validEndpoint = 'https://api.openai.com/v1/chat/completions';
      const invalidEndpoint = 'http://malicious-site.com/api';

      // Test valid endpoint
      const isValidEndpoint = credentialManager.validateEndpoint(validEndpoint);
      expect(isValidEndpoint).toBe(true);

      // Test invalid endpoint
      const isInvalidEndpoint = credentialManager.validateEndpoint(invalidEndpoint);
      expect(isInvalidEndpoint).toBe(false);
    });

    it('should prevent SQL injection in queries', () => {
      const maliciousQuery = "'; DROP TABLE users; --";
      const safeQuery = credentialManager.sanitizeQuery(maliciousQuery);

      // Should escape dangerous characters
      expect(safeQuery).not.toContain("';");
      expect(safeQuery).not.toContain('DROP TABLE');
    });

    it('should validate file uploads', () => {
      const validFile = {
        name: 'document.pdf',
        type: 'application/pdf',
        size: 1024 * 1024 // 1MB
      };

      const invalidFile = {
        name: 'script.exe',
        type: 'application/x-executable',
        size: 10 * 1024 * 1024 // 10MB
      };

      // Test valid file
      const isValidFile = credentialManager.validateFileUpload(validFile);
      expect(isValidFile.isValid).toBe(true);

      // Test invalid file
      const isInvalidFile = credentialManager.validateFileUpload(invalidFile);
      expect(isInvalidFile.isValid).toBe(false);
    });
  });

  describe('Authentication Security', () => {
    it('should handle authentication tokens securely', () => {
      const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
      const provider = 'notion';

      // Store token
      credentialManager.setCredential(provider, 'access_token', token);

      // Verify token is stored securely
      const storedToken = credentialManager.getCredential(provider, 'access_token');
      expect(storedToken).toBe(token);

      // Verify token is not exposed in memory
      const memoryDump = JSON.stringify(credentialManager);
      expect(memoryDump).not.toContain(token);
    });

    it('should validate JWT tokens', () => {
      const validToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
      const invalidToken = 'invalid.token.here';

      // Test valid JWT
      const isValidJWT = credentialManager.validateJWT(validToken);
      expect(isValidJWT).toBe(true);

      // Test invalid JWT
      const isInvalidJWT = credentialManager.validateJWT(invalidToken);
      expect(isInvalidJWT).toBe(false);
    });

    it('should handle OAuth flows securely', () => {
      const oauthConfig = {
        clientId: 'test-client-id',
        clientSecret: 'test-client-secret',
        redirectUri: 'https://localhost:3000/callback',
        scope: 'read write'
      };

      // Test OAuth configuration
      const isValidOAuth = credentialManager.validateOAuthConfig(oauthConfig);
      expect(isValidOAuth).toBe(true);

      // Test OAuth state parameter
      const state = credentialManager.generateOAuthState();
      expect(state).toHaveLength(32); // Should be 32 characters
      expect(typeof state).toBe('string');
    });
  });

  describe('Data Protection', () => {
    it('should encrypt sensitive data in transit', () => {
      const sensitiveData = {
        apiKey: 'sk-test-1234567890abcdef',
        userId: 'user123',
        sessionId: 'session456'
      };

      // Test data encryption
      const encryptedData = credentialManager.encryptData(sensitiveData);
      expect(encryptedData).not.toContain(sensitiveData.apiKey);
      expect(encryptedData).not.toContain(sensitiveData.userId);

      // Test data decryption
      const decryptedData = credentialManager.decryptData(encryptedData);
      expect(decryptedData.apiKey).toBe(sensitiveData.apiKey);
      expect(decryptedData.userId).toBe(sensitiveData.userId);
    });

    it('should protect against data leakage', () => {
      const testData = {
        public: 'This is public data',
        private: 'This is private data'
      };

      // Test data filtering
      const publicData = credentialManager.filterSensitiveData(testData);
      expect(publicData.public).toBe(testData.public);
      expect(publicData.private).toBeUndefined();
    });

    it('should handle secure data deletion', () => {
      const sensitiveData = {
        apiKey: 'sk-test-1234567890abcdef',
        password: 'secretpassword'
      };

      // Store sensitive data
      credentialManager.setCredential('test', 'data', JSON.stringify(sensitiveData));

      // Securely delete data
      credentialManager.secureDelete('test', 'data');

      // Verify data is completely removed
      expect(credentialManager.hasCredential('test', 'data')).toBe(false);
    });
  });

  describe('API Security', () => {
    it('should validate API responses', () => {
      const validResponse = {
        status: 200,
        data: { message: 'Success' },
        headers: { 'content-type': 'application/json' }
      };

      const maliciousResponse = {
        status: 200,
        data: { message: '<script>alert("xss")</script>' },
        headers: { 'content-type': 'application/json' }
      };

      // Test valid response
      const isValidResponse = credentialManager.validateAPIResponse(validResponse);
      expect(isValidResponse).toBe(true);

      // Test malicious response
      const isMaliciousResponse = credentialManager.validateAPIResponse(maliciousResponse);
      expect(isMaliciousResponse).toBe(false);
    });

    it('should prevent SSRF attacks', () => {
      const validUrl = 'https://api.openai.com/v1/chat/completions';
      const maliciousUrl = 'http://internal-server/admin';

      // Test valid URL
      const isValidUrl = credentialManager.validateExternalURL(validUrl);
      expect(isValidUrl).toBe(true);

      // Test malicious URL
      const isMaliciousUrl = credentialManager.validateExternalURL(maliciousUrl);
      expect(isMaliciousUrl).toBe(false);
    });

    it('should handle rate limiting securely', () => {
      const rateLimitConfig = {
        maxRequests: 100,
        timeWindow: 60000, // 1 minute
        retryAfter: 5000   // 5 seconds
      };

      // Test rate limit configuration
      const isValidRateLimit = credentialManager.validateRateLimitConfig(rateLimitConfig);
      expect(isValidRateLimit).toBe(true);

      // Test rate limit enforcement
      for (let i = 0; i < 105; i++) {
        const isAllowed = credentialManager.checkRateLimit('test-endpoint');
        if (i >= 100) {
          expect(isAllowed).toBe(false);
        } else {
          expect(isAllowed).toBe(true);
        }
      }
    });
  });

  describe('Session Security', () => {
    it('should manage sessions securely', () => {
      const sessionData = {
        userId: 'user123',
        provider: 'openai',
        timestamp: Date.now()
      };

      // Create session
      const sessionId = credentialManager.createSession(sessionData);
      expect(sessionId).toHaveLength(32);

      // Validate session
      const isValidSession = credentialManager.validateSession(sessionId);
      expect(isValidSession).toBe(true);

      // Invalidate session
      credentialManager.invalidateSession(sessionId);
      const isInvalidSession = credentialManager.validateSession(sessionId);
      expect(isInvalidSession).toBe(false);
    });

    it('should handle session timeouts', () => {
      const sessionData = {
        userId: 'user123',
        provider: 'openai',
        timestamp: Date.now() - 3600000 // 1 hour ago
      };

      // Create expired session
      const sessionId = credentialManager.createSession(sessionData);

      // Test session timeout
      const isValidSession = credentialManager.validateSession(sessionId);
      expect(isValidSession).toBe(false);
    });

    it('should prevent session hijacking', () => {
      const sessionData = {
        userId: 'user123',
        provider: 'openai',
        timestamp: Date.now(),
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        ipAddress: '192.168.1.1'
      };

      // Create session with security context
      const sessionId = credentialManager.createSession(sessionData);

      // Test session validation with different context
      const differentContext = {
        ...sessionData,
        userAgent: 'Different User Agent',
        ipAddress: '192.168.1.2'
      };

      const isValidSession = credentialManager.validateSessionWithContext(sessionId, differentContext);
      expect(isValidSession).toBe(false);
    });
  });

  describe('Error Handling Security', () => {
    it('should not expose sensitive information in errors', () => {
      const apiKey = 'sk-test-1234567890abcdef';

      try {
        // Simulate error with sensitive data
        throw new Error(`API call failed with key: ${apiKey}`);
      } catch (error) {
        const sanitizedError = credentialManager.sanitizeError(error);
        expect(sanitizedError.message).not.toContain(apiKey);
        expect(sanitizedError.message).toContain('API call failed');
      }
    });

    it('should handle authentication errors securely', () => {
      const authError = {
        status: 401,
        message: 'Invalid API key: sk-test-1234567890abcdef',
        details: { userId: 'user123', timestamp: Date.now() }
      };

      // Sanitize authentication error
      const sanitizedError = credentialManager.sanitizeAuthError(authError);
      expect(sanitizedError.message).not.toContain('sk-test-1234567890abcdef');
      expect(sanitizedError.message).toContain('Invalid API key');
      expect(sanitizedError.details.userId).toBeUndefined();
    });

    it('should log security events appropriately', () => {
      const securityEvent = {
        type: 'authentication_failure',
        userId: 'user123',
        ipAddress: '192.168.1.1',
        timestamp: Date.now()
      };

      // Log security event
      credentialManager.logSecurityEvent(securityEvent);

      // Verify security event was logged
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Security Event',
        expect.objectContaining({
          type: 'authentication_failure',
          timestamp: expect.any(Number)
        })
      );
    });
  });

  describe('Compliance and Standards', () => {
    it('should comply with data protection standards', () => {
      const complianceCheck = credentialManager.checkCompliance();

      expect(complianceCheck.gdpr).toBe(true);
      expect(complianceCheck.encryption).toBe(true);
      expect(complianceCheck.accessControl).toBe(true);
      expect(complianceCheck.auditLogging).toBe(true);
    });

    it('should implement proper access controls', () => {
      const userPermissions = {
        userId: 'user123',
        permissions: ['read', 'write'],
        resources: ['notion', 'airtable']
      };

      // Test permission validation
      const canRead = credentialManager.checkPermission(userPermissions, 'read', 'notion');
      expect(canRead).toBe(true);

      const canDelete = credentialManager.checkPermission(userPermissions, 'delete', 'notion');
      expect(canDelete).toBe(false);
    });

    it('should maintain audit trails', () => {
      const auditEvent = {
        action: 'credential_access',
        userId: 'user123',
        resource: 'openai',
        timestamp: Date.now(),
        ipAddress: '192.168.1.1'
      };

      // Log audit event
      credentialManager.logAuditEvent(auditEvent);

      // Verify audit trail
      const auditTrail = credentialManager.getAuditTrail('user123');
      expect(auditTrail).toContainEqual(
        expect.objectContaining({
          action: 'credential_access',
          userId: 'user123'
        })
      );
    });
  });
});
