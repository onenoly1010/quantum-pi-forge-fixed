'use client';

import { useEffect } from 'react';
import { initTracing } from './tracing';

export default function TracingProvider() {
  useEffect(() => {
    initTracing();
  }, []);

  return null;
}
