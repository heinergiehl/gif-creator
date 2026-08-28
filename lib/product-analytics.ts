'use client';

import { track } from '@vercel/analytics/react';

type AnalyticsValue = string | number | boolean | null;

export function trackProductEvent(name: string, properties?: Record<string, AnalyticsValue>): void {
  try {
    track(name, properties);
  } catch {
    // Analytics must never interrupt a local editing or export workflow.
  }
}
