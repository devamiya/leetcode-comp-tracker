import * as Sentry from '@sentry/react';
import posthog from 'posthog-js';

// Environment flags
const isProd = import.meta.env.MODE === 'production';

export function initTelemetry() {
  if (!isProd) {
    console.log('[Telemetry] Development mode: Mocking Sentry and PostHog');
    return;
  }

  // 1. Initialize Sentry
  // Note: DSN would normally come from env var like VITE_SENTRY_DSN
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN || '',
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration(),
    ],
    // Performance Monitoring
    tracesSampleRate: 1.0,
    tracePropagationTargets: ['localhost', /^https:\/\/devamiya\.com\/api/],
    // Session Replay
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  });

  // 2. Initialize PostHog
  // Note: API Key would come from env var like VITE_POSTHOG_KEY
  posthog.init(import.meta.env.VITE_POSTHOG_KEY || '', {
    api_host: import.meta.env.VITE_POSTHOG_HOST || 'https://app.posthog.com',
    capture_pageview: false, // We'll handle this manually in a router hook
    autocapture: true,
  });
}

export function identifyUser(user) {
  if (!isProd) return;
  if (!user) {
    posthog.reset();
    Sentry.setUser(null);
    return;
  }

  const identity = {
    email: user.email,
    id: user.id,
    name: user.name,
  };

  posthog.identify(user.id, identity);
  Sentry.setUser(identity);
}

export function captureException(error, context = {}) {
  if (!isProd) {
    console.error('[Mock Sentry Error]', error, context);
    return;
  }
  Sentry.captureException(error, { extra: context });
}
