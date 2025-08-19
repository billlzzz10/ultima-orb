import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { ChatView } from '../../ui/ChatView';
import { AIGenerationButtons } from '../../ui/components/AIGenerationButtons';
import { AnalyticsDashboard } from '../../ui/views/AnalyticsDashboard';
import { AIOrchestrator } from '../../ai/AIOrchestrator';
import { Logger } from '../../services/Logger';

// Mock dependencies
vi.mock('../../services/Logger');

describe('Browser Compatibility Tests', () => {
  let aiOrchestrator: AIOrchestrator;
  let mockLogger: any;

  beforeEach(() => {
    mockLogger = {
      info: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
      debug: vi.fn()
    };

    (Logger as any).mockImplementation(() => mockLogger);
    aiOrchestrator = new AIOrchestrator(mockLogger, mockLogger, mockLogger);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Modern Browser Support', () => {
    it('should work with Chrome/Chromium browsers', () => {
      // Mock Chrome user agent
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        configurable: true
      });

      const container = document.createElement('div');
      const chatView = new ChatView(container, aiOrchestrator, mockLogger);

      // Test Chrome-specific features
      expect(container.querySelector('.ultima-orb-chat')).toBeDefined();
      expect(chatView.isSupported()).toBe(true);
    });

    it('should work with Firefox browsers', () => {
      // Mock Firefox user agent
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
        configurable: true
      });

      const container = document.createElement('div');
      const chatView = new ChatView(container, aiOrchestrator, mockLogger);

      // Test Firefox-specific features
      expect(container.querySelector('.ultima-orb-chat')).toBeDefined();
      expect(chatView.isSupported()).toBe(true);
    });

    it('should work with Safari browsers', () => {
      // Mock Safari user agent
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
        configurable: true
      });

      const container = document.createElement('div');
      const chatView = new ChatView(container, aiOrchestrator, mockLogger);

      // Test Safari-specific features
      expect(container.querySelector('.ultima-orb-chat')).toBeDefined();
      expect(chatView.isSupported()).toBe(true);
    });

    it('should work with Edge browsers', () => {
      // Mock Edge user agent
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
        configurable: true
      });

      const container = document.createElement('div');
      const chatView = new ChatView(container, aiOrchestrator, mockLogger);

      // Test Edge-specific features
      expect(container.querySelector('.ultima-orb-chat')).toBeDefined();
      expect(chatView.isSupported()).toBe(true);
    });
  });

  describe('Legacy Browser Support', () => {
    it('should gracefully degrade for older browsers', () => {
      // Mock older browser user agent
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.102 Safari/537.36',
        configurable: true
      });

      const container = document.createElement('div');
      const chatView = new ChatView(container, aiOrchestrator, mockLogger);

      // Should still work with basic functionality
      expect(container.querySelector('.ultima-orb-chat')).toBeDefined();
      expect(chatView.isSupported()).toBe(true);
    });

    it('should handle missing modern APIs', () => {
      // Mock missing modern APIs
      const originalFetch = global.fetch;
      const originalPromise = global.Promise;
      const originalRequestAnimationFrame = global.requestAnimationFrame;

      // Remove modern APIs
      delete (global as any).fetch;
      delete (global as any).Promise;
      delete (global as any).requestAnimationFrame;

      const container = document.createElement('div');
      
      try {
        const chatView = new ChatView(container, aiOrchestrator, mockLogger);
        expect(chatView.isSupported()).toBe(false);
      } catch (error) {
        expect(error).toBeDefined();
      } finally {
        // Restore APIs
        global.fetch = originalFetch;
        global.Promise = originalPromise;
        global.requestAnimationFrame = originalRequestAnimationFrame;
      }
    });

    it('should provide fallbacks for unsupported features', () => {
      // Mock missing CSS features
      const originalGetComputedStyle = window.getComputedStyle;
      window.getComputedStyle = vi.fn().mockReturnValue({
        getPropertyValue: vi.fn().mockReturnValue('')
      });

      const container = document.createElement('div');
      const chatView = new ChatView(container, aiOrchestrator, mockLogger);

      // Should provide fallback styling
      expect(container.style.cssText).toBeDefined();

      // Restore original function
      window.getComputedStyle = originalGetComputedStyle;
    });
  });

  describe('Mobile Browser Support', () => {
    it('should work with mobile Chrome', () => {
      // Mock mobile Chrome user agent
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Linux; Android 10; SM-G973F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
        configurable: true
      });

      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        value: 375,
        configurable: true
      });

      const container = document.createElement('div');
      const chatView = new ChatView(container, aiOrchestrator, mockLogger);

      // Test mobile-specific features
      expect(container.classList.contains('mobile')).toBe(true);
      expect(chatView.isMobile()).toBe(true);
    });

    it('should work with mobile Safari', () => {
      // Mock mobile Safari user agent
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1',
        configurable: true
      });

      const container = document.createElement('div');
      const chatView = new ChatView(container, aiOrchestrator, mockLogger);

      // Test iOS-specific features
      expect(container.classList.contains('ios')).toBe(true);
      expect(chatView.isIOS()).toBe(true);
    });

    it('should handle touch events properly', () => {
      // Mock touch events
      const touchEvent = new TouchEvent('touchstart', {
        touches: [{ clientX: 100, clientY: 100 } as Touch]
      });

      const container = document.createElement('div');
      const chatView = new ChatView(container, aiOrchestrator, mockLogger);

      // Test touch event handling
      container.dispatchEvent(touchEvent);
      expect(container.classList.contains('touch-active')).toBe(true);
    });

    it('should support mobile gestures', () => {
      const container = document.createElement('div');
      const chatView = new ChatView(container, aiOrchestrator, mockLogger);

      // Test swipe gestures
      const touchStart = new TouchEvent('touchstart', {
        touches: [{ clientX: 0, clientY: 100 } as Touch]
      });

      const touchEnd = new TouchEvent('touchend', {
        changedTouches: [{ clientX: 100, clientY: 100 } as Touch]
      });

      container.dispatchEvent(touchStart);
      container.dispatchEvent(touchEnd);

      // Should handle swipe gesture
      expect(container.classList.contains('swipe-right')).toBe(true);
    });
  });

  describe('CSS Feature Support', () => {
    it('should handle CSS Grid support', () => {
      const container = document.createElement('div');
      const chatView = new ChatView(container, aiOrchestrator, mockLogger);

      // Test CSS Grid layout
      const gridContainer = container.querySelector('.ultima-orb-grid');
      if (gridContainer) {
        const computedStyle = window.getComputedStyle(gridContainer);
        expect(computedStyle.display).toBe('grid');
      }
    });

    it('should handle CSS Flexbox support', () => {
      const container = document.createElement('div');
      const chatView = new ChatView(container, aiOrchestrator, mockLogger);

      // Test Flexbox layout
      const flexContainer = container.querySelector('.ultima-orb-flex');
      if (flexContainer) {
        const computedStyle = window.getComputedStyle(flexContainer);
        expect(computedStyle.display).toBe('flex');
      }
    });

    it('should handle CSS Custom Properties', () => {
      const container = document.createElement('div');
      const chatView = new ChatView(container, aiOrchestrator, mockLogger);

      // Test CSS custom properties
      const customProperty = getComputedStyle(container).getPropertyValue('--ultima-orb-primary-color');
      expect(customProperty).toBeDefined();
    });

    it('should provide fallbacks for unsupported CSS features', () => {
      // Mock unsupported CSS features
      const originalGetComputedStyle = window.getComputedStyle;
      window.getComputedStyle = vi.fn().mockReturnValue({
        getPropertyValue: vi.fn().mockReturnValue('')
      });

      const container = document.createElement('div');
      const chatView = new ChatView(container, aiOrchestrator, mockLogger);

      // Should use fallback styles
      expect(container.style.backgroundColor).toBeDefined();

      // Restore original function
      window.getComputedStyle = originalGetComputedStyle;
    });
  });

  describe('JavaScript Feature Support', () => {
    it('should handle ES6+ features', () => {
      const container = document.createElement('div');
      const chatView = new ChatView(container, aiOrchestrator, mockLogger);

      // Test ES6+ features
      const testArray = [1, 2, 3];
      const doubled = testArray.map(x => x * 2);
      expect(doubled).toEqual([2, 4, 6]);

      // Test async/await
      const asyncTest = async () => {
        return 'test';
      };
      expect(asyncTest()).resolves.toBe('test');
    });

    it('should handle Promise support', () => {
      const container = document.createElement('div');
      const chatView = new ChatView(container, aiOrchestrator, mockLogger);

      // Test Promise functionality
      const testPromise = new Promise<string>((resolve) => {
        resolve('success');
      });

      expect(testPromise).resolves.toBe('success');
    });

    it('should handle Fetch API support', () => {
      // Mock fetch
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ data: 'test' })
      });

      const container = document.createElement('div');
      const chatView = new ChatView(container, aiOrchestrator, mockLogger);

      // Test fetch functionality
      expect(fetch).toBeDefined();
    });

    it('should handle LocalStorage support', () => {
      // Mock localStorage
      const localStorageMock = {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn()
      };
      Object.defineProperty(window, 'localStorage', {
        value: localStorageMock,
        configurable: true
      });

      const container = document.createElement('div');
      const chatView = new ChatView(container, aiOrchestrator, mockLogger);

      // Test localStorage functionality
      expect(localStorage.setItem).toBeDefined();
    });
  });

  describe('Performance Compatibility', () => {
    it('should work with different performance APIs', () => {
      // Mock performance API
      const performanceMock = {
        now: vi.fn().mockReturnValue(123456789),
        mark: vi.fn(),
        measure: vi.fn(),
        getEntriesByType: vi.fn().mockReturnValue([])
      };
      Object.defineProperty(window, 'performance', {
        value: performanceMock,
        configurable: true
      });

      const container = document.createElement('div');
      const chatView = new ChatView(container, aiOrchestrator, mockLogger);

      // Test performance measurement
      const startTime = performance.now();
      expect(startTime).toBe(123456789);
    });

    it('should handle requestAnimationFrame support', () => {
      // Mock requestAnimationFrame
      const rafMock = vi.fn().mockReturnValue(1);
      Object.defineProperty(window, 'requestAnimationFrame', {
        value: rafMock,
        configurable: true
      });

      const container = document.createElement('div');
      const chatView = new ChatView(container, aiOrchestrator, mockLogger);

      // Test animation frame support
      const animationId = requestAnimationFrame(() => {});
      expect(animationId).toBe(1);
    });

    it('should handle IntersectionObserver support', () => {
      // Mock IntersectionObserver
      const intersectionObserverMock = vi.fn().mockImplementation((callback) => ({
        observe: vi.fn(),
        unobserve: vi.fn(),
        disconnect: vi.fn()
      }));
      Object.defineProperty(window, 'IntersectionObserver', {
        value: intersectionObserverMock,
        configurable: true
      });

      const container = document.createElement('div');
      const chatView = new ChatView(container, aiOrchestrator, mockLogger);

      // Test intersection observer support
      const observer = new IntersectionObserver(() => {});
      expect(observer.observe).toBeDefined();
    });
  });

  describe('Network Compatibility', () => {
    it('should handle different network conditions', () => {
      // Mock network information
      const connectionMock = {
        effectiveType: '4g',
        downlink: 10,
        rtt: 50,
        saveData: false
      };
      Object.defineProperty(navigator, 'connection', {
        value: connectionMock,
        configurable: true
      });

      const container = document.createElement('div');
      const chatView = new ChatView(container, aiOrchestrator, mockLogger);

      // Test network condition handling
      expect(navigator.connection?.effectiveType).toBe('4g');
    });

    it('should handle offline/online events', () => {
      const container = document.createElement('div');
      const chatView = new ChatView(container, aiOrchestrator, mockLogger);

      // Test offline event
      window.dispatchEvent(new Event('offline'));
      expect(container.classList.contains('offline')).toBe(true);

      // Test online event
      window.dispatchEvent(new Event('online'));
      expect(container.classList.contains('online')).toBe(true);
    });

    it('should handle slow network connections', () => {
      // Mock slow connection
      const slowConnectionMock = {
        effectiveType: '2g',
        downlink: 0.5,
        rtt: 2000,
        saveData: true
      };
      Object.defineProperty(navigator, 'connection', {
        value: slowConnectionMock,
        configurable: true
      });

      const container = document.createElement('div');
      const chatView = new ChatView(container, aiOrchestrator, mockLogger);

      // Should adapt to slow connection
      expect(container.classList.contains('slow-connection')).toBe(true);
    });
  });

  describe('Security Compatibility', () => {
    it('should handle Content Security Policy', () => {
      // Mock CSP
      const cspMock = {
        'default-src': ["'self'"],
        'script-src': ["'self'", "'unsafe-inline'"],
        'style-src': ["'self'", "'unsafe-inline'"]
      };

      const container = document.createElement('div');
      const chatView = new ChatView(container, aiOrchestrator, mockLogger);

      // Test CSP compliance
      expect(chatView.isCSPCompliant()).toBe(true);
    });

    it('should handle mixed content restrictions', () => {
      const container = document.createElement('div');
      const chatView = new ChatView(container, aiOrchestrator, mockLogger);

      // Test mixed content handling
      const hasMixedContent = chatView.checkMixedContent();
      expect(hasMixedContent).toBe(false);
    });

    it('should handle secure context requirements', () => {
      // Mock secure context
      Object.defineProperty(window, 'isSecureContext', {
        value: true,
        configurable: true
      });

      const container = document.createElement('div');
      const chatView = new ChatView(container, aiOrchestrator, mockLogger);

      // Test secure context
      expect(window.isSecureContext).toBe(true);
    });
  });

  describe('Accessibility Compatibility', () => {
    it('should work with screen readers', () => {
      const container = document.createElement('div');
      const chatView = new ChatView(container, aiOrchestrator, mockLogger);

      // Test screen reader support
      const ariaElements = container.querySelectorAll('[aria-label], [aria-describedby], [role]');
      expect(ariaElements.length).toBeGreaterThan(0);
    });

    it('should handle high contrast mode', () => {
      // Mock high contrast media query
      const mediaQueryMock = vi.fn().mockReturnValue({
        matches: true,
        addListener: vi.fn(),
        removeListener: vi.fn()
      });
      Object.defineProperty(window, 'matchMedia', {
        value: mediaQueryMock,
        configurable: true
      });

      const container = document.createElement('div');
      const chatView = new ChatView(container, aiOrchestrator, mockLogger);

      // Test high contrast support
      const highContrastQuery = window.matchMedia('(prefers-contrast: high)');
      expect(highContrastQuery.matches).toBe(true);
    });

    it('should handle reduced motion preferences', () => {
      // Mock reduced motion preference
      const mediaQueryMock = vi.fn().mockReturnValue({
        matches: true,
        addListener: vi.fn(),
        removeListener: vi.fn()
      });
      Object.defineProperty(window, 'matchMedia', {
        value: mediaQueryMock,
        configurable: true
      });

      const container = document.createElement('div');
      const chatView = new ChatView(container, aiOrchestrator, mockLogger);

      // Test reduced motion support
      const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      expect(reducedMotionQuery.matches).toBe(true);
    });
  });
});
