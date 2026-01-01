'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// ==================== TYPES ====================
interface AgentService {
  name: string;
  url: string;
  displayName: string;
  description: string;
}

interface AgentHealthStatus {
  name: string;
  status: 'loading' | 'online' | 'offline' | 'degraded' | 'error';
  message?: string;
  lastChecked?: Date;
  responseTime?: number;
}

// ==================== CONSTANTS ====================
const HEALTH_CHECK_INTERVAL = 30000; // 30 seconds
const INITIAL_RETRY_DELAY = 1000;
const MAX_RETRIES = 3;
const REQUEST_TIMEOUT = 5000; // 5 seconds

// ==================== UTILITY FUNCTIONS ====================
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Fetch with timeout support
 */
const fetchWithTimeout = async (url: string, timeout: number = REQUEST_TIMEOUT): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
      },
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

/**
 * Check health of a single agent service
 */
const checkAgentHealth = async (service: AgentService): Promise<AgentHealthStatus> => {
  const startTime = Date.now();
  
  try {
    const response = await fetchWithTimeout(`${service.url}/health`, REQUEST_TIMEOUT);
    const responseTime = Date.now() - startTime;
    
    if (response.ok) {
      try {
        const data = await response.json();
        return {
          name: service.name,
          status: data.status === 'healthy' || data.status === 'ok' ? 'online' : 'degraded',
          message: data.message || 'Service is operational',
          lastChecked: new Date(),
          responseTime,
        };
      } catch {
        // Response OK but not JSON, still consider it healthy
        return {
          name: service.name,
          status: 'online',
          message: 'Service is operational',
          lastChecked: new Date(),
          responseTime,
        };
      }
    } else {
      return {
        name: service.name,
        status: 'degraded',
        message: `Service returned ${response.status}`,
        lastChecked: new Date(),
        responseTime,
      };
    }
  } catch (error) {
    const responseTime = Date.now() - startTime;
    return {
      name: service.name,
      status: 'offline',
      message: error instanceof Error ? error.message : 'Service unavailable',
      lastChecked: new Date(),
      responseTime,
    };
  }
};

// ==================== AGENT STATUS BADGE ====================
const AgentStatusBadge: React.FC<{ status: AgentHealthStatus['status'] }> = ({ status }) => {
  const statusConfig = {
    loading: {
      variant: 'outline' as const,
      className: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      icon: (
        <svg className="w-3 h-3 mr-1 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ),
      text: 'Checking',
    },
    online: {
      variant: 'default' as const,
      className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      icon: (
        <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ),
      text: 'Online',
    },
    offline: {
      variant: 'destructive' as const,
      className: 'bg-red-500/10 text-red-400 border-red-500/20',
      icon: (
        <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      ),
      text: 'Offline',
    },
    degraded: {
      variant: 'outline' as const,
      className: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      icon: (
        <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      text: 'Degraded',
    },
    error: {
      variant: 'destructive' as const,
      className: 'bg-red-500/10 text-red-400 border-red-500/20',
      icon: (
        <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      text: 'Error',
    },
  };

  const config = statusConfig[status];

  return (
    <Badge variant={config.variant} className={config.className}>
      {config.icon}
      {config.text}
    </Badge>
  );
};

// ==================== AGENT STATUS ITEM ====================
const AgentStatusItem: React.FC<{ status: AgentHealthStatus; service: AgentService }> = ({ status, service }) => {
  return (
    <div className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
      <div className="flex-1">
        <div className="flex items-center mb-1">
          <h4 className="text-white font-medium text-sm">{service.displayName}</h4>
          {status.responseTime && status.status === 'online' && (
            <span className="ml-2 text-white/40 text-xs">
              {status.responseTime}ms
            </span>
          )}
        </div>
        <p className="text-white/50 text-xs">{service.description}</p>
        {status.message && status.status !== 'online' && (
          <p className="text-white/40 text-xs mt-1 italic">{status.message}</p>
        )}
      </div>
      <div className="ml-4">
        <AgentStatusBadge status={status.status} />
      </div>
    </div>
  );
};

// ==================== ERROR BOUNDARY ====================
class AgentStatusErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    console.error('AgentStatusWidget error:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Card className="rounded-2xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/10">
          <CardHeader>
            <CardTitle className="text-white text-base">Agent Services</CardTitle>
            <CardDescription className="text-white/60 text-sm">Service monitoring unavailable</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <p className="text-white/60 text-sm">
                {this.state.error?.message || 'Failed to load agent status'}
              </p>
            </div>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}

// ==================== MAIN WIDGET COMPONENT ====================
export const AgentStatusWidget: React.FC = () => {
  const [agentStatuses, setAgentStatuses] = useState<AgentHealthStatus[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef<{ [key: string]: number }>({});

  // Get agent services from environment variables
  const agentServices: AgentService[] = React.useMemo(() => {
    const services: AgentService[] = [];
    
    // FastAPI Quantum Conduit
    const fastapiUrl = process.env.NEXT_PUBLIC_FASTAPI_URL;
    if (fastapiUrl) {
      services.push({
        name: 'fastapi',
        url: fastapiUrl,
        displayName: 'Quantum Conduit',
        description: 'FastAPI agent service',
      });
    }

    // Future services can be added here following the same pattern
    // Example:
    // const flaskUrl = process.env.NEXT_PUBLIC_FLASK_URL;
    // if (flaskUrl) {
    //   services.push({
    //     name: 'flask',
    //     url: flaskUrl,
    //     displayName: 'Glyph Weaver',
    //     description: 'Flask agent service',
    //   });
    // }

    return services;
  }, []);

  // Check health of all agent services
  const checkAllAgents = useCallback(async () => {
    if (agentServices.length === 0) {
      return;
    }

    const healthChecks = agentServices.map(async (service) => {
      const retryCount = retryCountRef.current[service.name] || 0;
      
      try {
        const status = await checkAgentHealth(service);
        
        // Reset retry count on success
        if (status.status === 'online') {
          retryCountRef.current[service.name] = 0;
        }
        
        return status;
      } catch (error) {
        // Increment retry count
        retryCountRef.current[service.name] = retryCount + 1;
        
        return {
          name: service.name,
          status: 'error' as const,
          message: error instanceof Error ? error.message : 'Unknown error',
          lastChecked: new Date(),
        };
      }
    });

    const results = await Promise.all(healthChecks);
    setAgentStatuses(results);
    setIsInitialized(true);
  }, [agentServices]);

  // Initialize and set up polling
  useEffect(() => {
    // Initial check
    if (agentServices.length > 0) {
      // Set loading state for all services
      setAgentStatuses(
        agentServices.map((service) => ({
          name: service.name,
          status: 'loading',
          lastChecked: new Date(),
        }))
      );
      
      checkAllAgents();
    } else {
      setIsInitialized(true);
    }

    // Set up polling interval
    if (agentServices.length > 0) {
      intervalRef.current = setInterval(checkAllAgents, HEALTH_CHECK_INTERVAL);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [agentServices, checkAllAgents]);

  // If no agent services are configured, show a helpful message
  if (agentServices.length === 0) {
    return (
      <Card className="rounded-2xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/10">
        <CardHeader>
          <CardTitle className="text-white text-base">Agent Services</CardTitle>
          <CardDescription className="text-white/60 text-sm">AI agent ecosystem monitoring</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-white/60 text-sm mb-2">No agent services configured</p>
            <p className="text-white/40 text-xs">
              Set <code className="text-cyan-400">NEXT_PUBLIC_FASTAPI_URL</code> to enable monitoring
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <AgentStatusErrorBoundary>
      <Card className="rounded-2xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white text-base">Agent Services</CardTitle>
              <CardDescription className="text-white/60 text-sm">AI agent ecosystem monitoring</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              {isInitialized && (
                <button
                  onClick={checkAllAgents}
                  className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white/80 transition-colors"
                  title="Refresh status"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {agentStatuses.length > 0 ? (
            <div className="space-y-0">
              {agentStatuses.map((status, index) => {
                const service = agentServices.find(s => s.name === status.name);
                if (!service) return null;
                return (
                  <AgentStatusItem 
                    key={status.name} 
                    status={status} 
                    service={service}
                  />
                );
              })}
            </div>
          ) : (
            <div className="text-center py-4">
              <svg className="w-8 h-8 mx-auto mb-2 text-white/40 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <p className="text-white/50 text-sm">Checking agent services...</p>
            </div>
          )}
        </CardContent>
      </Card>
    </AgentStatusErrorBoundary>
  );
};

export default AgentStatusWidget;
