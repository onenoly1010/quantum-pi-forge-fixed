'use client';

import { useEffect } from 'react';

export default function TracingProvider() {
  useEffect(() => {
    // OpenTelemetry tracing is optional
    // To enable, install required packages and rename app/tracing.ts.optional to app/tracing.ts
    console.log('Tracing provider loaded (OpenTelemetry disabled)');
  }, []);

  return null;
}
