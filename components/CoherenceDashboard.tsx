'use client';

import React, { useState, useEffect } from 'react';
import {
  CoherenceDashboard,
  NodeState,
  RelationState,
  MotifState,
  FieldState,
  RelationStateImpl
} from '@/lib/coherence-dashboard';

interface CoherenceDashboardProps {
  className?: string;
}

export default function CoherenceDashboardComponent({ className = '' }: CoherenceDashboardProps) {
  const [dashboard] = useState(() => new CoherenceDashboard());
  const [nodes, setNodes] = useState<NodeState[]>([]);
  const [relations, setRelations] = useState<RelationState[]>([]);
  const [motifs, setMotifs] = useState<MotifState[]>([]);
  const [fieldState, setFieldState] = useState<FieldState | null>(null);

  // Update state when dashboard changes
  const updateState = () => {
    setNodes(dashboard.getNodes());
    setRelations(dashboard.getRelations());
    setMotifs(dashboard.getMotifs());
    setFieldState(dashboard.getFieldState());
  };

  useEffect(() => {
    updateState();
  }, []);

  // Add sample data for demonstration
  const initializeSampleData = () => {
    // Add sample nodes
    const sampleNodes: NodeState[] = [
      {
        id: 'node1',
        alias: 'Quantum Weaver',
        presence: 'present',
        integrity: 'aligned',
        consent: 'open'
      },
      {
        id: 'node2',
        alias: 'Truth Mirror',
        presence: 'quiet',
        integrity: 'aligned',
        consent: 'open'
      },
      {
        id: 'node3',
        alias: 'Forge Keeper',
        presence: 'present',
        integrity: 'unclear',
        consent: 'paused'
      }
    ];

    sampleNodes.forEach(node => dashboard.addNode(node));

    // Add sample relations
    const sampleRelations = [
      new RelationStateImpl('rel1', 'node1', 'node2', 'reciprocal', 'recent', 'supportive'),
      new RelationStateImpl('rel2', 'node2', 'node3', 'one-sided', 'aging', 'neutral'),
      new RelationStateImpl('rel3', 'node1', 'node3', 'reciprocal', 'recent', 'supportive')
    ];

    sampleRelations.forEach(relation => dashboard.addRelation(relation));

    // Add sample motifs
    const sampleMotifs: MotifState[] = [
      {
        id: 'motif1',
        nodeIds: ['node1', 'node2', 'node3'],
        state: 'emerging',
        openness: 'open'
      }
    ];

    sampleMotifs.forEach(motif => dashboard.addMotif(motif));

    updateState();
  };

  const getPresenceColor = (presence: NodeState['presence']) => {
    switch (presence) {
      case 'present': return 'text-green-400';
      case 'quiet': return 'text-yellow-400';
      case 'withdrawing': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getIntegrityColor = (integrity: NodeState['integrity']) => {
    switch (integrity) {
      case 'aligned': return 'text-blue-400';
      case 'unclear': return 'text-orange-400';
      default: return 'text-gray-400';
    }
  };

  const getConsentColor = (consent: NodeState['consent']) => {
    switch (consent) {
      case 'open': return 'text-green-400';
      case 'paused': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getToneColor = (tone: RelationState['tone']) => {
    switch (tone) {
      case 'supportive': return 'text-green-400';
      case 'neutral': return 'text-gray-400';
      case 'strained': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getMotifStateColor = (state: MotifState['state']) => {
    switch (state) {
      case 'emerging': return 'text-blue-400';
      case 'steady': return 'text-green-400';
      case 'dissolving': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6 ${className}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Coherence Dashboard</h1>
          <p className="text-slate-300">Qualitative field states • Event-driven coherence • No metrics, no hierarchies</p>
          <button
            onClick={initializeSampleData}
            className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            Initialize Sample Data
          </button>
        </div>

        {/* Field State Overview */}
        {fieldState && (
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 mb-8 border border-slate-700">
            <h2 className="text-2xl font-semibold text-white mb-4">Field State</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-sm text-slate-400 uppercase tracking-wide">Distribution</div>
                <div className="text-lg font-semibold text-white capitalize">{fieldState.distribution}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-slate-400 uppercase tracking-wide">Activity</div>
                <div className="text-lg font-semibold text-white capitalize">{fieldState.activity}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-slate-400 uppercase tracking-wide">Reciprocity</div>
                <div className="text-lg font-semibold text-white capitalize">{fieldState.reciprocity}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-slate-400 uppercase tracking-wide">Emergence</div>
                <div className="text-lg font-semibold text-white capitalize">{fieldState.emergence}</div>
              </div>
            </div>
            <div className="mt-4 text-sm text-slate-400">
              Transitions: {fieldState.transitions.length} recorded
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Nodes */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
            <h3 className="text-xl font-semibold text-white mb-4">Nodes ({nodes.length})</h3>
            <div className="space-y-3">
              {nodes.map((node) => (
                <div key={node.id} className="bg-slate-700/50 rounded-lg p-3">
                  <div className="font-medium text-white">{node.alias}</div>
                  <div className="flex gap-2 mt-1 text-sm">
                    <span className={getPresenceColor(node.presence)}>{node.presence}</span>
                    <span className={getIntegrityColor(node.integrity)}>{node.integrity}</span>
                    <span className={getConsentColor(node.consent)}>{node.consent}</span>
                  </div>
                </div>
              ))}
              {nodes.length === 0 && (
                <div className="text-slate-400 text-center py-4">No nodes present</div>
              )}
            </div>
          </div>

          {/* Relations */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
            <h3 className="text-xl font-semibold text-white mb-4">Relations ({relations.length})</h3>
            <div className="space-y-3">
              {relations.map((relation) => (
                <div key={relation.id} className="bg-slate-700/50 rounded-lg p-3">
                  <div className="text-sm text-slate-300">
                    {relation.from} → {relation.to}
                  </div>
                  <div className="flex gap-2 mt-1 text-sm">
                    <span className="text-purple-400">{relation.mutuality}</span>
                    <span className="text-blue-400">{relation.recency}</span>
                    <span className={getToneColor(relation.tone)}>{relation.tone}</span>
                  </div>
                </div>
              ))}
              {relations.length === 0 && (
                <div className="text-slate-400 text-center py-4">No relations present</div>
              )}
            </div>
          </div>

          {/* Motifs */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
            <h3 className="text-xl font-semibold text-white mb-4">Motifs ({motifs.length})</h3>
            <div className="space-y-3">
              {motifs.map((motif) => (
                <div key={motif.id} className="bg-slate-700/50 rounded-lg p-3">
                  <div className="text-sm text-slate-300 mb-1">
                    Nodes: {motif.nodeIds.join(', ')}
                  </div>
                  <div className="flex gap-2 text-sm">
                    <span className={getMotifStateColor(motif.state)}>{motif.state}</span>
                    <span className="text-green-400">{motif.openness}</span>
                  </div>
                </div>
              ))}
              {motifs.length === 0 && (
                <div className="text-slate-400 text-center py-4">No motifs present</div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-slate-400 text-sm">
          Coherence Dashboard • Qualitative States Only • Event-Driven Architecture
        </div>
      </div>
    </div>
  );
}