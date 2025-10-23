import { FPS_CHECK_INTERVAL, LOW_FPS_COUNT_THRESHOLD, LOW_FPS_THRESHOLD } from './constants';
import type { PerformanceMetrics } from './types';

/**
 * Initialize performance metrics
 */
export function initializePerformanceMetrics(): PerformanceMetrics {
  return {
    fpsFrameCount: 0,
    fpsLastTime: performance.now(),
    currentFPS: 60,
    lowFPSCount: 0,
  };
}

/**
 * Update FPS metrics and check for performance degradation
 * Returns true if bloom should be disabled due to low FPS
 */
export function updateFPS(metrics: PerformanceMetrics, bloomEnabled: boolean): boolean {
  metrics.fpsFrameCount++;

  // Check FPS every N frames
  if (metrics.fpsFrameCount >= FPS_CHECK_INTERVAL) {
    const now = performance.now();
    const delta = now - metrics.fpsLastTime;
    metrics.currentFPS = Math.round((1000 * metrics.fpsFrameCount) / delta);
    metrics.fpsLastTime = now;
    metrics.fpsFrameCount = 0;

    // Degradation strategy: disable bloom if FPS is consistently low
    if (metrics.currentFPS < LOW_FPS_THRESHOLD) {
      metrics.lowFPSCount++;

      if (metrics.lowFPSCount >= LOW_FPS_COUNT_THRESHOLD && bloomEnabled) {
        console.warn(
          `Low FPS detected (${metrics.currentFPS}fps), disabling bloom for better performance`
        );
        return false; // Signal to disable bloom
      }
    } else {
      // Reset counter if FPS is good
      metrics.lowFPSCount = 0;
    }
  }

  return bloomEnabled;
}

/**
 * Get current FPS value
 */
export function getCurrentFPS(metrics: PerformanceMetrics): number {
  return metrics.currentFPS;
}
