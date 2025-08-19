import { App, PluginSettingTab, Setting, ButtonComponent, TextComponent, DropdownComponent } from 'obsidian';
import { PerformanceOptimizer, PerformanceMetrics } from '../../utils/PerformanceOptimizer';
import { AIOrchestrator } from '../../ai/AIOrchestrator';
import { Logger } from '../../services/Logger';

export interface AnalyticsData {
  performance: PerformanceMetrics;
  usage: {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    averageResponseTime: number;
    providerUsage: Record<string, number>;
  };
  system: {
    memoryUsage: number;
    cacheSize: number;
    cacheHitRate: number;
    activeConnections: number;
    uptime: number;
  };
  errors: {
    totalErrors: number;
    errorRate: number;
    recentErrors: Array<{
      timestamp: Date;
      error: string;
      provider?: string;
    }>;
  };
}

export interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
  }>;
}

export class AnalyticsDashboard {
  private containerEl: HTMLElement;
  private performanceOptimizer: PerformanceOptimizer;
  private aiOrchestrator: AIOrchestrator;
  private logger: Logger;
  private updateInterval: NodeJS.Timeout | null = null;
  private analyticsData: AnalyticsData;

  // UI Elements
  private metricsContainer: HTMLElement;
  private chartsContainer: HTMLElement;
  private realtimeContainer: HTMLElement;

  constructor(
    containerEl: HTMLElement,
    performanceOptimizer: PerformanceOptimizer,
    aiOrchestrator: AIOrchestrator,
    logger: Logger
  ) {
    this.containerEl = containerEl;
    this.performanceOptimizer = performanceOptimizer;
    this.aiOrchestrator = aiOrchestrator;
    this.logger = logger;
    this.analyticsData = this.initializeAnalyticsData();

    this.initializeUI();
    this.startRealtimeUpdates();
  }

  private initializeAnalyticsData(): AnalyticsData {
    return {
      performance: this.performanceOptimizer.getMetrics(),
      usage: {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        averageResponseTime: 0,
        providerUsage: {}
      },
      system: {
        memoryUsage: 0,
        cacheSize: 0,
        cacheHitRate: 0,
        activeConnections: 0,
        uptime: 0
      },
      errors: {
        totalErrors: 0,
        errorRate: 0,
        recentErrors: []
      }
    };
  }

  private initializeUI(): void {
    // Clear container
    this.containerEl.empty();

    // Create header
    const headerEl = this.containerEl.createEl('div', { cls: 'ultima-orb-analytics-header' });
    headerEl.createEl('h3', { text: '📊 Analytics Dashboard', cls: 'ultima-orb-analytics-title' });

    // Controls
    const controlsEl = headerEl.createEl('div', { cls: 'ultima-orb-analytics-controls' });

    const refreshButton = new ButtonComponent(controlsEl)
      .setButtonText('🔄 Refresh')
      .setClass('ultima-orb-button ultima-orb-refresh-button')
      .onClick(() => this.refreshData());

    const exportButton = new ButtonComponent(controlsEl)
      .setButtonText('📤 Export Data')
      .setClass('ultima-orb-button ultima-orb-export-button')
      .onClick(() => this.exportData());

    const clearButton = new ButtonComponent(controlsEl)
      .setButtonText('🗑️ Clear Data')
      .setClass('ultima-orb-button ultima-orb-clear-button')
      .onClick(() => this.clearData());

    // Main content area
    const contentEl = this.containerEl.createEl('div', { cls: 'ultima-orb-analytics-content' });

    // Metrics overview
    const metricsPanel = contentEl.createEl('div', { cls: 'ultima-orb-metrics-panel' });
    metricsPanel.createEl('h4', { text: '📈 Key Metrics', cls: 'ultima-orb-panel-title' });
    this.metricsContainer = metricsPanel.createEl('div', { cls: 'ultima-orb-metrics-grid' });

    // Charts section
    const chartsPanel = contentEl.createEl('div', { cls: 'ultima-orb-charts-panel' });
    chartsPanel.createEl('h4', { text: '📊 Performance Charts', cls: 'ultima-orb-panel-title' });
    this.chartsContainer = chartsPanel.createEl('div', { cls: 'ultima-orb-charts-grid' });

    // Realtime monitoring
    const realtimePanel = contentEl.createEl('div', { cls: 'ultima-orb-realtime-panel' });
    realtimePanel.createEl('h4', { text: '⚡ Real-time Monitoring', cls: 'ultima-orb-panel-title' });
    this.realtimeContainer = realtimePanel.createEl('div', { cls: 'ultima-orb-realtime-content' });

    // Initial render
    this.renderMetrics();
    this.renderCharts();
    this.renderRealtimeData();
  }

  private renderMetrics(): void {
    this.metricsContainer.empty();

    const metrics = [
      {
        title: 'Memory Usage',
        value: `${(this.analyticsData.system.memoryUsage / 1024 / 1024).toFixed(2)} MB`,
        icon: '💾',
        color: this.getMemoryColor()
      },
      {
        title: 'Cache Hit Rate',
        value: `${(this.analyticsData.system.cacheHitRate * 100).toFixed(1)}%`,
        icon: '🎯',
        color: this.getCacheHitRateColor()
      },
      {
        title: 'Response Time',
        value: `${this.analyticsData.performance.averageResponseTime.toFixed(2)}ms`,
        icon: '⚡',
        color: this.getResponseTimeColor()
      },
      {
        title: 'Error Rate',
        value: `${(this.analyticsData.errors.errorRate * 100).toFixed(2)}%`,
        icon: '⚠️',
        color: this.getErrorRateColor()
      },
      {
        title: 'Active Connections',
        value: this.analyticsData.system.activeConnections.toString(),
        icon: '🔗',
        color: 'var(--text-normal)'
      },
      {
        title: 'Total Requests',
        value: this.analyticsData.usage.totalRequests.toString(),
        icon: '📨',
        color: 'var(--text-normal)'
      }
    ];

    metrics.forEach(metric => {
      const metricCard = this.metricsContainer.createEl('div', { cls: 'ultima-orb-metric-card' });
      
      const headerEl = metricCard.createEl('div', { cls: 'ultima-orb-metric-header' });
      headerEl.createEl('span', { 
        cls: 'ultima-orb-metric-icon',
        text: metric.icon
      });
      headerEl.createEl('h5', { 
        cls: 'ultima-orb-metric-title',
        text: metric.title
      });

      const valueEl = metricCard.createEl('div', { 
        cls: 'ultima-orb-metric-value',
        text: metric.value
      });
      valueEl.style.color = metric.color;
    });
  }

  private renderCharts(): void {
    this.chartsContainer.empty();

    // Provider Usage Chart
    const providerChartContainer = this.chartsContainer.createEl('div', { cls: 'ultima-orb-chart-container' });
    providerChartContainer.createEl('h5', { text: 'Provider Usage', cls: 'ultima-orb-chart-title' });
    this.renderProviderUsageChart(providerChartContainer);

    // Response Time Trend Chart
    const responseTimeChartContainer = this.chartsContainer.createEl('div', { cls: 'ultima-orb-chart-container' });
    responseTimeChartContainer.createEl('h5', { text: 'Response Time Trend', cls: 'ultima-orb-chart-title' });
    this.renderResponseTimeChart(responseTimeChartContainer);

    // Error Trend Chart
    const errorChartContainer = this.chartsContainer.createEl('div', { cls: 'ultima-orb-chart-container' });
    errorChartContainer.createEl('h5', { text: 'Error Trend', cls: 'ultima-orb-chart-title' });
    this.renderErrorChart(errorChartContainer);
  }

  private renderProviderUsageChart(container: HTMLElement): void {
    const providers = Object.keys(this.analyticsData.usage.providerUsage);
    const usageData = Object.values(this.analyticsData.usage.providerUsage);
    
    if (providers.length === 0) {
      container.createEl('p', { 
        text: 'No provider usage data available',
        cls: 'ultima-orb-no-data'
      });
      return;
    }

    const chartEl = container.createEl('div', { cls: 'ultima-orb-chart' });
    
    // Create simple bar chart
    const maxUsage = Math.max(...usageData);
    providers.forEach((provider, index) => {
      const barContainer = chartEl.createEl('div', { cls: 'ultima-orb-chart-bar-container' });
      
      const labelEl = barContainer.createEl('div', { 
        cls: 'ultima-orb-chart-label',
        text: provider
      });
      
      const barEl = barContainer.createEl('div', { cls: 'ultima-orb-chart-bar' });
      const percentage = maxUsage > 0 ? (usageData[index] / maxUsage) * 100 : 0;
      barEl.style.width = `${percentage}%`;
      barEl.style.backgroundColor = this.getProviderColor(provider);
      
      const valueEl = barContainer.createEl('div', { 
        cls: 'ultima-orb-chart-value',
        text: usageData[index].toString()
      });
    });
  }

  private renderResponseTimeChart(container: HTMLElement): void {
    // Simulate response time data over time
    const timeLabels = ['1m ago', '30s ago', '15s ago', 'Now'];
    const responseTimes = [
      this.analyticsData.performance.averageResponseTime * 0.8,
      this.analyticsData.performance.averageResponseTime * 0.9,
      this.analyticsData.performance.averageResponseTime * 1.1,
      this.analyticsData.performance.averageResponseTime
    ];

    const chartEl = container.createEl('div', { cls: 'ultima-orb-chart' });
    
    // Create simple line chart
    const maxTime = Math.max(...responseTimes);
    timeLabels.forEach((label, index) => {
      const pointContainer = chartEl.createEl('div', { cls: 'ultima-orb-chart-point-container' });
      
      const labelEl = pointContainer.createEl('div', { 
        cls: 'ultima-orb-chart-label',
        text: label
      });
      
      const pointEl = pointContainer.createEl('div', { cls: 'ultima-orb-chart-point' });
      const percentage = maxTime > 0 ? (responseTimes[index] / maxTime) * 100 : 0;
      pointEl.style.height = `${percentage}%`;
      pointEl.style.backgroundColor = this.getResponseTimeColor();
      
      const valueEl = pointContainer.createEl('div', { 
        cls: 'ultima-orb-chart-value',
        text: `${responseTimes[index].toFixed(1)}ms`
      });
    });
  }

  private renderErrorChart(container: HTMLElement): void {
    // Simulate error data over time
    const timeLabels = ['1m ago', '30s ago', '15s ago', 'Now'];
    const errorRates = [
      this.analyticsData.errors.errorRate * 0.5,
      this.analyticsData.errors.errorRate * 0.8,
      this.analyticsData.errors.errorRate * 1.2,
      this.analyticsData.errors.errorRate
    ];

    const chartEl = container.createEl('div', { cls: 'ultima-orb-chart' });
    
    // Create simple line chart
    const maxRate = Math.max(...errorRates);
    timeLabels.forEach((label, index) => {
      const pointContainer = chartEl.createEl('div', { cls: 'ultima-orb-chart-point-container' });
      
      const labelEl = pointContainer.createEl('div', { 
        cls: 'ultima-orb-chart-label',
        text: label
      });
      
      const pointEl = pointContainer.createEl('div', { cls: 'ultima-orb-chart-point' });
      const percentage = maxRate > 0 ? (errorRates[index] / maxRate) * 100 : 0;
      pointEl.style.height = `${percentage}%`;
      pointEl.style.backgroundColor = this.getErrorRateColor();
      
      const valueEl = pointContainer.createEl('div', { 
        cls: 'ultima-orb-chart-value',
        text: `${(errorRates[index] * 100).toFixed(2)}%`
      });
    });
  }

  private renderRealtimeData(): void {
    this.realtimeContainer.empty();

    // System Health Status
    const healthSection = this.realtimeContainer.createEl('div', { cls: 'ultima-orb-health-section' });
    healthSection.createEl('h5', { text: '🏥 System Health', cls: 'ultima-orb-section-title' });
    
    const healthStatus = this.getSystemHealthStatus();
    const healthEl = healthSection.createEl('div', { 
      cls: `ultima-orb-health-status ultima-orb-health-${healthStatus.level}`,
      text: healthStatus.message
    });

    // Recent Activity
    const activitySection = this.realtimeContainer.createEl('div', { cls: 'ultima-orb-activity-section' });
    activitySection.createEl('h5', { text: '📝 Recent Activity', cls: 'ultima-orb-section-title' });
    
    const activityList = activitySection.createEl('div', { cls: 'ultima-orb-activity-list' });
    
    // Simulate recent activity
    const activities = [
      { time: '2s ago', action: 'AI request completed', provider: 'claude', status: 'success' },
      { time: '5s ago', action: 'Cache hit', provider: 'ollama', status: 'info' },
      { time: '10s ago', action: 'Provider switched', provider: 'openai', status: 'info' },
      { time: '15s ago', action: 'Memory optimization', provider: 'system', status: 'warning' }
    ];

    activities.forEach(activity => {
      const activityEl = activityList.createEl('div', { cls: 'ultima-orb-activity-item' });
      
      const timeEl = activityEl.createEl('span', { 
        cls: 'ultima-orb-activity-time',
        text: activity.time
      });
      
      const actionEl = activityEl.createEl('span', { 
        cls: 'ultima-orb-activity-action',
        text: activity.action
      });
      
      const providerEl = activityEl.createEl('span', { 
        cls: 'ultima-orb-activity-provider',
        text: activity.provider
      });
      
      activityEl.addClass(`ultima-orb-activity-${activity.status}`);
    });

    // Recent Errors
    if (this.analyticsData.errors.recentErrors.length > 0) {
      const errorSection = this.realtimeContainer.createEl('div', { cls: 'ultima-orb-error-section' });
      errorSection.createEl('h5', { text: '⚠️ Recent Errors', cls: 'ultima-orb-section-title' });
      
      const errorList = errorSection.createEl('div', { cls: 'ultima-orb-error-list' });
      
      this.analyticsData.errors.recentErrors.slice(0, 5).forEach(error => {
        const errorEl = errorList.createEl('div', { cls: 'ultima-orb-error-item' });
        
        const timeEl = errorEl.createEl('span', { 
          cls: 'ultima-orb-error-time',
          text: error.timestamp.toLocaleTimeString()
        });
        
        const messageEl = errorEl.createEl('span', { 
          cls: 'ultima-orb-error-message',
          text: error.error
        });
        
        if (error.provider) {
          const providerEl = errorEl.createEl('span', { 
            cls: 'ultima-orb-error-provider',
            text: error.provider
          });
        }
      });
    }
  }

  private getSystemHealthStatus(): { level: string; message: string } {
    const memoryUsage = this.analyticsData.system.memoryUsage / 1024 / 1024; // MB
    const errorRate = this.analyticsData.errors.errorRate;
    const responseTime = this.analyticsData.performance.averageResponseTime;

    if (memoryUsage > 100 || errorRate > 0.1 || responseTime > 5000) {
      return { level: 'critical', message: 'System experiencing issues' };
    } else if (memoryUsage > 50 || errorRate > 0.05 || responseTime > 2000) {
      return { level: 'warning', message: 'System under moderate load' };
    } else {
      return { level: 'healthy', message: 'System operating normally' };
    }
  }

  private getMemoryColor(): string {
    const memoryUsage = this.analyticsData.system.memoryUsage / 1024 / 1024; // MB
    if (memoryUsage > 100) return '#ff4444';
    if (memoryUsage > 50) return '#ffaa00';
    return '#44ff44';
  }

  private getCacheHitRateColor(): string {
    const hitRate = this.analyticsData.system.cacheHitRate;
    if (hitRate > 0.8) return '#44ff44';
    if (hitRate > 0.5) return '#ffaa00';
    return '#ff4444';
  }

  private getResponseTimeColor(): string {
    const responseTime = this.analyticsData.performance.averageResponseTime;
    if (responseTime < 1000) return '#44ff44';
    if (responseTime < 3000) return '#ffaa00';
    return '#ff4444';
  }

  private getErrorRateColor(): string {
    const errorRate = this.analyticsData.errors.errorRate;
    if (errorRate < 0.01) return '#44ff44';
    if (errorRate < 0.05) return '#ffaa00';
    return '#ff4444';
  }

  private getProviderColor(provider: string): string {
    const colors = {
      ollama: '#4CAF50',
      claude: '#FF6B35',
      openai: '#10A37F',
      gemini: '#4285F4',
      anythingllm: '#9C27B0'
    };
    return colors[provider as keyof typeof colors] || '#666666';
  }

  private refreshData(): void {
    this.updateAnalyticsData();
    this.renderMetrics();
    this.renderCharts();
    this.renderRealtimeData();
    this.logger.info('Analytics dashboard refreshed');
  }

  private updateAnalyticsData(): void {
    // Update performance metrics
    this.analyticsData.performance = this.performanceOptimizer.getMetrics();
    
    // Update system metrics
    const detailedMetrics = this.performanceOptimizer.getDetailedMetrics();
    this.analyticsData.system = {
      memoryUsage: detailedMetrics.memoryUsageMB * 1024 * 1024,
      cacheSize: detailedMetrics.cacheSize,
      cacheHitRate: detailedMetrics.cacheHitRate,
      activeConnections: detailedMetrics.activeConnections,
      uptime: Date.now() // Simplified uptime
    };

    // Update usage metrics
    this.analyticsData.usage = {
      totalRequests: detailedMetrics.totalRequests,
      successfulRequests: detailedMetrics.totalRequests - detailedMetrics.errorCount,
      failedRequests: detailedMetrics.errorCount,
      averageResponseTime: detailedMetrics.averageResponseTime,
      providerUsage: this.getProviderUsage()
    };

    // Update error metrics
    this.analyticsData.errors = {
      totalErrors: detailedMetrics.errorCount,
      errorRate: detailedMetrics.errorRate,
      recentErrors: this.getRecentErrors()
    };
  }

  private getProviderUsage(): Record<string, number> {
    // This would be implemented based on actual usage tracking
    return {
      ollama: Math.floor(Math.random() * 50) + 10,
      claude: Math.floor(Math.random() * 30) + 5,
      openai: Math.floor(Math.random() * 40) + 8,
      gemini: Math.floor(Math.random() * 20) + 3,
      anythingllm: Math.floor(Math.random() * 15) + 2
    };
  }

  private getRecentErrors(): Array<{ timestamp: Date; error: string; provider?: string }> {
    // This would be implemented based on actual error tracking
    return [
      {
        timestamp: new Date(Date.now() - 5000),
        error: 'Network timeout',
        provider: 'claude'
      },
      {
        timestamp: new Date(Date.now() - 15000),
        error: 'Rate limit exceeded',
        provider: 'openai'
      }
    ];
  }

  private exportData(): void {
    const dataStr = JSON.stringify(this.analyticsData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `ultima-orb-analytics-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    this.logger.info('Analytics data exported');
  }

  private clearData(): void {
    this.performanceOptimizer.clear();
    this.analyticsData = this.initializeAnalyticsData();
    this.refreshData();
    this.logger.info('Analytics data cleared');
  }

  private startRealtimeUpdates(): void {
    this.updateInterval = setInterval(() => {
      this.updateAnalyticsData();
      this.renderRealtimeData();
    }, 5000); // Update every 5 seconds
  }

  public destroy(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    this.containerEl.empty();
  }
}
