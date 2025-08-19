import { Logger } from '../services/Logger';

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
  accessCount: number;
  lastAccessed: number;
}

export interface PerformanceMetrics {
  memoryUsage: number;
  cacheHitRate: number;
  averageResponseTime: number;
  activeConnections: number;
  errorRate: number;
}

export interface OptimizationConfig {
  maxCacheSize: number;
  defaultTTL: number;
  cleanupInterval: number;
  memoryThreshold: number;
  enableCompression: boolean;
  enableLazyLoading: boolean;
}

export class PerformanceOptimizer {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private metrics: PerformanceMetrics = {
    memoryUsage: 0,
    cacheHitRate: 0,
    averageResponseTime: 0,
    activeConnections: 0,
    errorRate: 0
  };
  private config: OptimizationConfig;
  private logger: Logger;
  private cleanupInterval: NodeJS.Timeout | null = null;
  private responseTimes: number[] = [];
  private errorCount = 0;
  private totalRequests = 0;

  constructor(logger: Logger, config?: Partial<OptimizationConfig>) {
    this.logger = logger;
    this.config = {
      maxCacheSize: 1000,
      defaultTTL: 300000, // 5 minutes
      cleanupInterval: 60000, // 1 minute
      memoryThreshold: 50 * 1024 * 1024, // 50MB
      enableCompression: true,
      enableLazyLoading: true,
      ...config
    };

    this.startCleanupInterval();
    this.logger.info('PerformanceOptimizer initialized', this.config);
  }

  // Cache Management
  public set<T>(key: string, data: T, ttl?: number): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.config.defaultTTL,
      accessCount: 0,
      lastAccessed: Date.now()
    };

    // Check cache size limit
    if (this.cache.size >= this.config.maxCacheSize) {
      this.evictLeastUsed();
    }

    this.cache.set(key, entry);
    this.logger.debug(`Cached data for key: ${key}`);
  }

  public get<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T>;
    
    if (!entry) {
      this.updateMetrics(false);
      return null;
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.updateMetrics(false);
      return null;
    }

    // Update access statistics
    entry.accessCount++;
    entry.lastAccessed = Date.now();
    this.updateMetrics(true);

    this.logger.debug(`Cache hit for key: ${key}`);
    return entry.data;
  }

  public has(key: string): boolean {
    return this.cache.has(key) && !this.isExpired(key);
  }

  public delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.logger.debug(`Deleted cache entry: ${key}`);
    }
    return deleted;
  }

  public clear(): void {
    this.cache.clear();
    this.logger.info('Cache cleared');
  }

  public getCacheStats(): { size: number; hitRate: number; memoryUsage: number } {
    return {
      size: this.cache.size,
      hitRate: this.metrics.cacheHitRate,
      memoryUsage: this.estimateCacheMemoryUsage()
    };
  }

  // Memory Management
  public optimizeMemory(): void {
    const currentMemory = this.getMemoryUsage();
    
    if (currentMemory > this.config.memoryThreshold) {
      this.logger.warn(`Memory usage high: ${(currentMemory / 1024 / 1024).toFixed(2)}MB`);
      this.performMemoryOptimization();
    }
  }

  private performMemoryOptimization(): void {
    // Remove expired entries
    this.removeExpiredEntries();
    
    // Evict least used entries if still over threshold
    if (this.getMemoryUsage() > this.config.memoryThreshold) {
      this.evictLeastUsed();
    }
    
    // Force garbage collection if available
    if (typeof global.gc === 'function') {
      global.gc();
    }
    
    this.logger.info('Memory optimization completed');
  }

  private removeExpiredEntries(): void {
    const now = Date.now();
    let removedCount = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
        removedCount++;
      }
    }
    
    if (removedCount > 0) {
      this.logger.debug(`Removed ${removedCount} expired cache entries`);
    }
  }

  private evictLeastUsed(): void {
    const entries = Array.from(this.cache.entries());
    
    // Sort by access count and last accessed time
    entries.sort((a, b) => {
      if (a[1].accessCount !== b[1].accessCount) {
        return a[1].accessCount - b[1].accessCount;
      }
      return a[1].lastAccessed - b[1].lastAccessed;
    });
    
    // Remove 20% of least used entries
    const removeCount = Math.ceil(entries.length * 0.2);
    for (let i = 0; i < removeCount; i++) {
      this.cache.delete(entries[i][0]);
    }
    
    this.logger.debug(`Evicted ${removeCount} least used cache entries`);
  }

  // Performance Monitoring
  public startRequestTimer(): () => void {
    const startTime = performance.now();
    this.totalRequests++;
    
    return () => {
      const duration = performance.now() - startTime;
      this.recordResponseTime(duration);
    };
  }

  public recordError(error: Error): void {
    this.errorCount++;
    this.updateErrorRate();
    this.logger.error('Performance error recorded:', error);
  }

  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  public getDetailedMetrics(): PerformanceMetrics & {
    cacheSize: number;
    totalRequests: number;
    errorCount: number;
    memoryUsageMB: number;
  } {
    return {
      ...this.metrics,
      cacheSize: this.cache.size,
      totalRequests: this.totalRequests,
      errorCount: this.errorCount,
      memoryUsageMB: this.getMemoryUsage() / 1024 / 1024
    };
  }

  // Response Time Tracking
  private recordResponseTime(duration: number): void {
    this.responseTimes.push(duration);
    
    // Keep only last 100 response times
    if (this.responseTimes.length > 100) {
      this.responseTimes.shift();
    }
    
    this.updateAverageResponseTime();
  }

  private updateAverageResponseTime(): void {
    if (this.responseTimes.length > 0) {
      const sum = this.responseTimes.reduce((a, b) => a + b, 0);
      this.metrics.averageResponseTime = sum / this.responseTimes.length;
    }
  }

  // Cache Hit Rate Tracking
  private updateMetrics(isHit: boolean): void {
    const totalHits = this.metrics.cacheHitRate * this.totalRequests;
    const newTotalHits = totalHits + (isHit ? 1 : 0);
    this.totalRequests++;
    
    this.metrics.cacheHitRate = newTotalHits / this.totalRequests;
  }

  private updateErrorRate(): void {
    this.metrics.errorRate = this.errorCount / this.totalRequests;
  }

  // Memory Usage Monitoring
  private getMemoryUsage(): number {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      return process.memoryUsage().heapUsed;
    }
    
    // Fallback for browser environment
    if (typeof performance !== 'undefined' && performance.memory) {
      return (performance as any).memory.usedJSHeapSize;
    }
    
    return 0;
  }

  private estimateCacheMemoryUsage(): number {
    let totalSize = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      totalSize += this.estimateObjectSize(key);
      totalSize += this.estimateObjectSize(entry);
    }
    
    return totalSize;
  }

  private estimateObjectSize(obj: any): number {
    const str = JSON.stringify(obj);
    return new Blob([str]).size;
  }

  // Utility Methods
  private isExpired(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return true;
    
    return Date.now() - entry.timestamp > entry.ttl;
  }

  private startCleanupInterval(): void {
    this.cleanupInterval = setInterval(() => {
      this.removeExpiredEntries();
      this.optimizeMemory();
      this.updateMetrics();
    }, this.config.cleanupInterval);
  }

  private updateMetrics(): void {
    this.metrics.memoryUsage = this.getMemoryUsage();
    this.updateAverageResponseTime();
    this.updateErrorRate();
  }

  // Compression Utilities
  public compressData(data: string): string {
    if (!this.config.enableCompression) return data;
    
    try {
      // Simple compression for text data
      return data.replace(/\s+/g, ' ').trim();
    } catch (error) {
      this.logger.warn('Compression failed, returning original data:', error);
      return data;
    }
  }

  public decompressData(compressedData: string): string {
    if (!this.config.enableCompression) return compressedData;
    
    try {
      // Simple decompression
      return compressedData;
    } catch (error) {
      this.logger.warn('Decompression failed, returning compressed data:', error);
      return compressedData;
    }
  }

  // Lazy Loading Support
  public createLazyLoader<T>(
    key: string,
    loader: () => Promise<T>,
    ttl?: number
  ): () => Promise<T> {
    return async (): Promise<T> => {
      // Check cache first
      const cached = this.get<T>(key);
      if (cached !== null) {
        return cached;
      }

      // Load data
      try {
        const data = await loader();
        this.set(key, data, ttl);
        return data;
      } catch (error) {
        this.recordError(error as Error);
        throw error;
      }
    };
  }

  // Connection Pool Management
  public trackConnection(): () => void {
    this.metrics.activeConnections++;
    
    return () => {
      this.metrics.activeConnections = Math.max(0, this.metrics.activeConnections - 1);
    };
  }

  // Cleanup
  public destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    
    this.clear();
    this.logger.info('PerformanceOptimizer destroyed');
  }

  // Configuration Management
  public updateConfig(newConfig: Partial<OptimizationConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.logger.info('PerformanceOptimizer config updated', this.config);
  }

  public getConfig(): OptimizationConfig {
    return { ...this.config };
  }
}
