/**
 * Frontend Evaluation Utilities for Quantum Pi Forge
 * 
 * Provides client-side evaluation metrics collection and reporting
 * for Next.js/React components in the Sacred Trinity architecture.
 */

import { createSpan, getTracer } from './tracing';

// Evaluation metrics types
export interface ComponentMetrics {
  componentName: string;
  renderTime: number;
  interactionLatency: number;
  accessibilityScore: number;
  performanceScore: number;
  timestamp: string;
}

export interface UserInteractionMetrics {
  eventType: string;
  targetComponent: string;
  responseTime: number;
  success: boolean;
  timestamp: string;
}

export interface PagePerformanceMetrics {
  route: string;
  loadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  timeToInteractive: number;
  timestamp: string;
}

// Metrics storage
const metricsStore: {
  components: ComponentMetrics[];
  interactions: UserInteractionMetrics[];
  pagePerformance: PagePerformanceMetrics[];
} = {
  components: [],
  interactions: [],
  pagePerformance: [],
};

/**
 * Measure component render time
 */
export function measureRenderTime(componentName: string, startTime: number): ComponentMetrics {
  const endTime = performance.now();
  const renderTime = endTime - startTime;
  
  const metrics: ComponentMetrics = {
    componentName,
    renderTime,
    interactionLatency: 0,
    accessibilityScore: 0,
    performanceScore: calculatePerformanceScore(renderTime),
    timestamp: new Date().toISOString(),
  };
  
  metricsStore.components.push(metrics);
  
  // Create tracing span
  const span = createSpan('component.render', {
    'component.name': componentName,
    'component.render_time_ms': renderTime,
    'component.performance_score': metrics.performanceScore,
  });
  span?.end();
  
  return metrics;
}

/**
 * Track user interaction metrics
 */
export function trackInteraction(
  eventType: string,
  targetComponent: string,
  startTime: number,
  success: boolean = true
): UserInteractionMetrics {
  const responseTime = performance.now() - startTime;
  
  const metrics: UserInteractionMetrics = {
    eventType,
    targetComponent,
    responseTime,
    success,
    timestamp: new Date().toISOString(),
  };
  
  metricsStore.interactions.push(metrics);
  
  // Create tracing span
  const span = createSpan('user.interaction', {
    'interaction.type': eventType,
    'interaction.target': targetComponent,
    'interaction.response_time_ms': responseTime,
    'interaction.success': success,
  });
  span?.end();
  
  return metrics;
}

/**
 * Collect Web Vitals metrics
 */
export function collectWebVitals(route: string): Promise<PagePerformanceMetrics> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !window.performance) {
      resolve({
        route,
        loadTime: 0,
        firstContentfulPaint: 0,
        largestContentfulPaint: 0,
        cumulativeLayoutShift: 0,
        timeToInteractive: 0,
        timestamp: new Date().toISOString(),
      });
      return;
    }
    
    // Wait for page to fully load
    setTimeout(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType('paint');
      
      const fcpEntry = paint.find(entry => entry.name === 'first-contentful-paint');
      
      const metrics: PagePerformanceMetrics = {
        route,
        loadTime: navigation?.loadEventEnd - navigation?.startTime || 0,
        firstContentfulPaint: fcpEntry?.startTime || 0,
        largestContentfulPaint: 0, // Requires PerformanceObserver
        cumulativeLayoutShift: 0, // Requires PerformanceObserver
        timeToInteractive: navigation?.domInteractive - navigation?.startTime || 0,
        timestamp: new Date().toISOString(),
      };
      
      metricsStore.pagePerformance.push(metrics);
      
      // Create tracing span
      const span = createSpan('page.performance', {
        'page.route': route,
        'page.load_time_ms': metrics.loadTime,
        'page.fcp_ms': metrics.firstContentfulPaint,
        'page.tti_ms': metrics.timeToInteractive,
      });
      span?.end();
      
      resolve(metrics);
    }, 1000);
  });
}

/**
 * Calculate performance score based on render time
 */
function calculatePerformanceScore(renderTime: number): number {
  // Score based on render time thresholds
  if (renderTime < 16) return 1.0; // 60fps threshold
  if (renderTime < 33) return 0.9; // 30fps threshold
  if (renderTime < 100) return 0.7; // Good
  if (renderTime < 300) return 0.5; // Acceptable
  if (renderTime < 1000) return 0.3; // Needs improvement
  return 0.1; // Poor
}

/**
 * Get all collected metrics
 */
export function getAllMetrics() {
  return {
    ...metricsStore,
    summary: {
      totalComponents: metricsStore.components.length,
      totalInteractions: metricsStore.interactions.length,
      totalPageViews: metricsStore.pagePerformance.length,
      averageRenderTime: calculateAverage(metricsStore.components.map(m => m.renderTime)),
      averageInteractionTime: calculateAverage(metricsStore.interactions.map(m => m.responseTime)),
      averageLoadTime: calculateAverage(metricsStore.pagePerformance.map(m => m.loadTime)),
    },
    collectedAt: new Date().toISOString(),
  };
}

/**
 * Calculate average of numbers array
 */
function calculateAverage(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  return numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
}

/**
 * Export metrics for evaluation
 */
export function exportMetricsForEvaluation(): string {
  const metrics = getAllMetrics();
  return JSON.stringify(metrics, null, 2);
}

/**
 * Clear collected metrics
 */
export function clearMetrics() {
  metricsStore.components = [];
  metricsStore.interactions = [];
  metricsStore.pagePerformance = [];
}

/**
 * React hook for component performance tracking
 */
export function useComponentMetrics(componentName: string) {
  const startTime = performance.now();
  
  return {
    recordRender: () => measureRenderTime(componentName, startTime),
    trackClick: (success?: boolean) => trackInteraction('click', componentName, performance.now(), success),
    trackSubmit: (success?: boolean) => trackInteraction('submit', componentName, performance.now(), success),
  };
}

/**
 * Higher-order component for automatic performance tracking
 */
export function withMetrics<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName: string
) {
  return function MetricsWrapper(props: P) {
    const startTime = performance.now();
    
    // Record render on mount
    if (typeof window !== 'undefined') {
      requestAnimationFrame(() => {
        measureRenderTime(componentName, startTime);
      });
    }
    
    return <WrappedComponent {...props} />;
  };
}

// Export default metrics instance
export default {
  measureRenderTime,
  trackInteraction,
  collectWebVitals,
  getAllMetrics,
  exportMetricsForEvaluation,
  clearMetrics,
  useComponentMetrics,
  withMetrics,
};
