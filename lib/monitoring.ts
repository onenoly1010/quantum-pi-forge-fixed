/**
 * Quantum Pi Forge - Production Monitoring Configuration
 * 
 * This module sets up comprehensive monitoring including:
 * - Performance metrics
 * - Error tracking
 * - User analytics
 * - Transaction monitoring
 * - Health checks
 */

// ==================== TYPES ====================

export interface MetricEvent {
  name: string;
  value: number;
  tags?: Record<string, string>;
  timestamp?: number;
}

export interface ErrorEvent {
  message: string;
  stack?: string;
  context?: Record<string, unknown>;
  severity: 'low' | 'medium' | 'high' | 'critical';
  userId?: string;
}

export interface TransactionEvent {
  txHash: string;
  type: 'stake' | 'unstake' | 'transfer' | 'swap';
  amount: string;
  userAddress: string;
  status: 'pending' | 'confirmed' | 'failed';
  gasUsed?: string;
  timestamp: number;
}

export interface HealthStatus {
  service: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  latency?: number;
  lastCheck: number;
  details?: Record<string, unknown>;
}

// ==================== MONITORING SERVICE ====================

class MonitoringService {
  private static instance: MonitoringService;
  private metrics: MetricEvent[] = [];
  private errors: ErrorEvent[] = [];
  private transactions: TransactionEvent[] = [];
  private healthChecks: Map<string, HealthStatus> = new Map();
  private isEnabled: boolean = true;

  private constructor() {
    // Initialize monitoring
    if (typeof window !== 'undefined') {
      this.setupBrowserMonitoring();
    }
  }

  static getInstance(): MonitoringService {
    if (!MonitoringService.instance) {
      MonitoringService.instance = new MonitoringService();
    }
    return MonitoringService.instance;
  }

  // ==================== METRICS ====================

  /**
   * Record a custom metric
   */
  recordMetric(event: MetricEvent): void {
    if (!this.isEnabled) return;

    const enrichedEvent = {
      ...event,
      timestamp: event.timestamp || Date.now(),
    };

    this.metrics.push(enrichedEvent);

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[Metric]', enrichedEvent);
    }

    // Send to analytics endpoint
    this.sendToAnalytics('metric', enrichedEvent);
  }

  /**
   * Record page load performance
   */
  recordPageLoad(): void {
    if (typeof window === 'undefined' || !window.performance) return;

    const timing = performance.timing;
    const loadTime = timing.loadEventEnd - timing.navigationStart;
    const domReady = timing.domContentLoadedEventEnd - timing.navigationStart;
    const firstPaint = performance.getEntriesByType('paint')[0]?.startTime || 0;

    this.recordMetric({
      name: 'page_load',
      value: loadTime,
      tags: {
        dom_ready: String(domReady),
        first_paint: String(firstPaint),
        path: window.location.pathname,
      },
    });
  }

  // ==================== ERROR TRACKING ====================

  /**
   * Track an error event
   */
  trackError(error: Error | string, context?: Record<string, unknown>, severity: ErrorEvent['severity'] = 'medium'): void {
    if (!this.isEnabled) return;

    const errorEvent: ErrorEvent = {
      message: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      context: {
        ...context,
        url: typeof window !== 'undefined' ? window.location.href : undefined,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      },
      severity,
    };

    this.errors.push(errorEvent);

    // Always log errors
    console.error('[Error Tracked]', errorEvent);

    // Send to error reporting service
    this.sendToAnalytics('error', errorEvent);
  }

  /**
   * Setup global error handlers
   */
  private setupBrowserMonitoring(): void {
    // Unhandled errors
    window.addEventListener('error', (event) => {
      this.trackError(event.error || event.message, {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      }, 'high');
    });

    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.trackError(
        event.reason instanceof Error ? event.reason : String(event.reason),
        { type: 'unhandledrejection' },
        'high'
      );
    });

    // Record page load after DOM ready
    if (document.readyState === 'complete') {
      this.recordPageLoad();
    } else {
      window.addEventListener('load', () => this.recordPageLoad());
    }
  }

  // ==================== TRANSACTION MONITORING ====================

  /**
   * Track a blockchain transaction
   */
  trackTransaction(event: Omit<TransactionEvent, 'timestamp'>): void {
    if (!this.isEnabled) return;

    const txEvent: TransactionEvent = {
      ...event,
      timestamp: Date.now(),
    };

    this.transactions.push(txEvent);

    // Log transaction
    console.log('[Transaction]', txEvent);

    // Send to analytics
    this.sendToAnalytics('transaction', txEvent);

    // Record metric
    this.recordMetric({
      name: `transaction_${event.type}_${event.status}`,
      value: 1,
      tags: {
        type: event.type,
        status: event.status,
      },
    });
  }

  /**
   * Update transaction status
   */
  updateTransactionStatus(txHash: string, status: TransactionEvent['status']): void {
    const tx = this.transactions.find(t => t.txHash === txHash);
    if (tx) {
      tx.status = status;
      this.sendToAnalytics('transaction_update', { txHash, status });
    }
  }

  // ==================== HEALTH CHECKS ====================

  /**
   * Record health check result
   */
  recordHealthCheck(status: HealthStatus): void {
    this.healthChecks.set(status.service, status);

    if (status.status !== 'healthy') {
      this.trackError(
        `Service ${status.service} is ${status.status}`,
        { service: status.service, details: status.details },
        status.status === 'unhealthy' ? 'critical' : 'medium'
      );
    }
  }

  /**
   * Get all health statuses
   */
  getHealthStatuses(): HealthStatus[] {
    return Array.from(this.healthChecks.values());
  }

  /**
   * Check API health
   */
  async checkAPIHealth(endpoint: string): Promise<HealthStatus> {
    const startTime = Date.now();
    
    try {
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      });

      const latency = Date.now() - startTime;
      const status: HealthStatus = {
        service: endpoint,
        status: response.ok ? 'healthy' : 'degraded',
        latency,
        lastCheck: Date.now(),
        details: { statusCode: response.status },
      };

      this.recordHealthCheck(status);
      return status;
    } catch (error) {
      const status: HealthStatus = {
        service: endpoint,
        status: 'unhealthy',
        latency: Date.now() - startTime,
        lastCheck: Date.now(),
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
      };

      this.recordHealthCheck(status);
      return status;
    }
  }

  // ==================== USER ANALYTICS ====================

  /**
   * Track a user action
   */
  trackAction(action: string, properties?: Record<string, unknown>): void {
    if (!this.isEnabled) return;

    const event = {
      action,
      properties,
      timestamp: Date.now(),
      sessionId: this.getSessionId(),
    };

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[Action]', event);
    }

    this.sendToAnalytics('action', event);
  }

  /**
   * Track wallet connection
   */
  trackWalletConnection(address: string, network: string): void {
    this.trackAction('wallet_connected', {
      address: address.slice(0, 6) + '...' + address.slice(-4), // Privacy
      network,
    });
  }

  /**
   * Track staking action
   */
  trackStakingAction(amount: string, success: boolean): void {
    this.trackAction('staking_attempt', {
      success,
      amountRange: this.getAmountRange(parseFloat(amount)),
    });

    this.recordMetric({
      name: success ? 'staking_success' : 'staking_failure',
      value: 1,
    });
  }

  // ==================== HELPERS ====================

  private getSessionId(): string {
    if (typeof window === 'undefined') return 'server';
    
    let sessionId = sessionStorage.getItem('qpf_session_id');
    if (!sessionId) {
      sessionId = `sess_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      sessionStorage.setItem('qpf_session_id', sessionId);
    }
    return sessionId;
  }

  private getAmountRange(amount: number): string {
    if (amount < 1) return '0-1';
    if (amount < 10) return '1-10';
    if (amount < 100) return '10-100';
    if (amount < 1000) return '100-1000';
    return '1000+';
  }

  private async sendToAnalytics(type: string, data: unknown): Promise<void> {
    // In production, send to your analytics endpoint
    if (process.env.NODE_ENV === 'production') {
      try {
        // Example: Send to a logging endpoint
        // await fetch('/api/analytics', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({ type, data, timestamp: Date.now() }),
        // });
      } catch (error) {
        // Silently fail analytics - don't affect user experience
        console.warn('Analytics send failed:', error);
      }
    }
  }

  // ==================== DIAGNOSTICS ====================

  /**
   * Get monitoring diagnostics
   */
  getDiagnostics(): Record<string, unknown> {
    return {
      metricsCount: this.metrics.length,
      errorsCount: this.errors.length,
      transactionsCount: this.transactions.length,
      healthChecks: Object.fromEntries(this.healthChecks),
      recentErrors: this.errors.slice(-5),
      recentTransactions: this.transactions.slice(-10),
      isEnabled: this.isEnabled,
    };
  }

  /**
   * Enable/disable monitoring
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  /**
   * Clear all collected data
   */
  clear(): void {
    this.metrics = [];
    this.errors = [];
    this.transactions = [];
  }
}

// ==================== EXPORTS ====================

export const monitoring = MonitoringService.getInstance();

// Convenience exports
export const recordMetric = (event: MetricEvent) => monitoring.recordMetric(event);
export const trackError = (error: Error | string, context?: Record<string, unknown>, severity?: ErrorEvent['severity']) => 
  monitoring.trackError(error, context, severity);
export const trackTransaction = (event: Omit<TransactionEvent, 'timestamp'>) => monitoring.trackTransaction(event);
export const trackAction = (action: string, properties?: Record<string, unknown>) => monitoring.trackAction(action, properties);
export const checkAPIHealth = (endpoint: string) => monitoring.checkAPIHealth(endpoint);
export const getDiagnostics = () => monitoring.getDiagnostics();

export default monitoring;
