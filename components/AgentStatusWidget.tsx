'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Activity, CheckCircle2, XCircle, AlertCircle, RefreshCw } from 'lucide-react';

interface ServiceHealth {
  name: string;
  status: 'healthy' | 'unhealthy' | 'unknown';
  url: string;
  responseTime?: number;
  lastChecked: string;
  error?: string;
}

interface AgentHealthData {
  timestamp: string;
  overallStatus: 'healthy' | 'degraded' | 'unavailable';
  services: {
    fastapi: ServiceHealth;
    flask: ServiceHealth;
    gradio: ServiceHealth;
  };
}

/**
 * Custom hook for fetching agent health status
 */
function useAgentHealth(refreshInterval: number = 30000) {
  const [data, setData] = useState<AgentHealthData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHealth = async () => {
    try {
      const response = await fetch('/api/agent-health');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const healthData = await response.json();
      setData(healthData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch agent health');
      console.error('Agent health fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  return { data, isLoading, error, refetch: fetchHealth };
}

/**
 * Get status icon and color based on service health
 */
function getStatusDisplay(status: string) {
  switch (status) {
    case 'healthy':
      return {
        icon: CheckCircle2,
        color: 'text-green-500',
        bgColor: 'bg-green-500/10',
        label: 'Healthy',
        variant: 'default' as const,
      };
    case 'unhealthy':
      return {
        icon: XCircle,
        color: 'text-red-500',
        bgColor: 'bg-red-500/10',
        label: 'Unhealthy',
        variant: 'destructive' as const,
      };
    default:
      return {
        icon: AlertCircle,
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-500/10',
        label: 'Unknown',
        variant: 'secondary' as const,
      };
  }
}

/**
 * Get overall status display
 */
function getOverallStatusDisplay(status: string) {
  switch (status) {
    case 'healthy':
      return {
        icon: CheckCircle2,
        color: 'text-green-500',
        label: 'All Systems Operational',
        description: 'All agent services are healthy',
      };
    case 'degraded':
      return {
        icon: AlertCircle,
        color: 'text-yellow-500',
        label: 'Degraded Performance',
        description: 'Some agent services are unavailable',
      };
    default:
      return {
        icon: XCircle,
        color: 'text-red-500',
        label: 'Services Unavailable',
        description: 'Agent services are currently offline',
      };
  }
}

/**
 * AgentStatusWidget Component
 * 
 * Displays real-time health status of all agent services in the ecosystem.
 * Automatically refreshes every 30 seconds and provides visual indicators.
 */
export default function AgentStatusWidget() {
  const { data, isLoading, error, refetch } = useAgentHealth();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  if (isLoading) {
    return (
      <Card className="w-full backdrop-blur-md bg-white/10 border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Activity className="h-5 w-5 animate-pulse" />
            Agent Services
          </CardTitle>
          <CardDescription className="text-white/70">
            Loading service status...
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full backdrop-blur-md bg-white/10 border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <XCircle className="h-5 w-5 text-red-500" />
            Agent Services
          </CardTitle>
          <CardDescription className="text-red-300">
            Failed to load service status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <button
            onClick={handleRefresh}
            className="text-sm text-white/70 hover:text-white transition-colors"
          >
            Try again
          </button>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return null;
  }

  const overallStatus = getOverallStatusDisplay(data.overallStatus);
  const StatusIcon = overallStatus.icon;

  return (
    <Card className="w-full backdrop-blur-md bg-white/10 border-white/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-white">
              <StatusIcon className={`h-5 w-5 ${overallStatus.color}`} />
              Agent Services
            </CardTitle>
            <CardDescription className="text-white/70">
              {overallStatus.description}
            </CardDescription>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="text-white/70 hover:text-white transition-colors disabled:opacity-50"
            aria-label="Refresh status"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {Object.entries(data.services).map(([key, service]) => {
            const statusDisplay = getStatusDisplay(service.status);
            const StatusIcon = statusDisplay.icon;

            return (
              <TooltipProvider key={key}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center justify-between p-3 rounded-lg backdrop-blur-sm bg-white/5 hover:bg-white/10 transition-colors cursor-help">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${statusDisplay.bgColor}`}>
                          <StatusIcon className={`h-4 w-4 ${statusDisplay.color}`} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{service.name}</p>
                          {service.responseTime !== undefined && (
                            <p className="text-xs text-white/50">
                              {service.responseTime}ms
                            </p>
                          )}
                        </div>
                      </div>
                      <Badge variant={statusDisplay.variant} className="text-xs">
                        {statusDisplay.label}
                      </Badge>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="space-y-1">
                      <p className="font-semibold">{service.name}</p>
                      <p className="text-xs text-muted-foreground">URL: {service.url}</p>
                      <p className="text-xs text-muted-foreground">
                        Last checked: {new Date(service.lastChecked).toLocaleTimeString()}
                      </p>
                      {service.error && (
                        <p className="text-xs text-red-400">Error: {service.error}</p>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          })}
        </div>
        <div className="mt-4 pt-4 border-t border-white/10">
          <p className="text-xs text-white/50 text-center">
            Auto-refreshes every 30 seconds • Last updated:{' '}
            {new Date(data.timestamp).toLocaleTimeString()}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
