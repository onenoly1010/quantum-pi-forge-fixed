// Canonical interfaces for Coherence Dashboard
// Enforces qualitative, event-driven states only
// No numerical metrics, no hierarchies, no ownership

export interface NodeState {
  id: string;
  alias: string;
  presence: 'present' | 'quiet' | 'withdrawing';
  integrity: 'aligned' | 'unclear';
  consent: 'open' | 'paused';
  // Invariant: No performance, engagement, or contribution fields
}

export interface RelationState {
  id: string;
  from: string;
  to: string;
  mutuality: 'reciprocal' | 'one-sided';
  recency: 'recent' | 'aging' | 'dormant';
  tone: 'supportive' | 'neutral' | 'strained';
  // Validation method to enforce rules
  isValid(): boolean;
}

export interface MotifState {
  id: string;
  nodeIds: string[];
  state: 'emerging' | 'steady' | 'dissolving';
  openness: 'open' | 'closed';
  // Invariant: No leader/owner fields, no percentage contributions
}

export interface FieldState {
  distribution: 'diffuse' | 'clustered';
  activity: 'quiet' | 'active';
  reciprocity: 'low' | 'high';
  emergence: 'none' | 'localized';
  transitions: Array<{
    timestamp: number;
    from: FieldState;
    to: FieldState;
    triggeredBy: string;
  }>;
}

// Example usage enforcement (for reference, not part of schema)
export function validateRelation(relation: RelationState): void {
  if (!relation.isValid()) {
    throw new Error('Invalid relation state: Recent one-sided relations disallowed');
  }
}

// Implementation of RelationState validation
export class RelationStateImpl implements RelationState {
  id: string;
  from: string;
  to: string;
  mutuality: 'reciprocal' | 'one-sided';
  recency: 'recent' | 'aging' | 'dormant';
  tone: 'supportive' | 'neutral' | 'strained';

  constructor(
    id: string,
    from: string,
    to: string,
    mutuality: 'reciprocal' | 'one-sided',
    recency: 'recent' | 'aging' | 'dormant',
    tone: 'supportive' | 'neutral' | 'strained'
  ) {
    this.id = id;
    this.from = from;
    this.to = to;
    this.mutuality = mutuality;
    this.recency = recency;
    this.tone = tone;
  }

  isValid(): boolean {
    // Rule: Recent one-sided relations cannot imply reciprocity growth
    if (this.mutuality === 'one-sided' && this.recency === 'recent') {
      return false;
    }
    // Additional checks can be added here if needed
    return true;
  }
}

// Coherence Dashboard State Manager
export class CoherenceDashboard {
  private nodes: Map<string, NodeState> = new Map();
  private relations: Map<string, RelationState> = new Map();
  private motifs: Map<string, MotifState> = new Map();
  private fieldState: FieldState;

  constructor() {
    this.fieldState = {
      distribution: 'diffuse',
      activity: 'quiet',
      reciprocity: 'low',
      emergence: 'none',
      transitions: []
    };
  }

  // Node management
  addNode(node: NodeState): void {
    this.nodes.set(node.id, node);
    this.updateFieldState();
  }

  updateNode(id: string, updates: Partial<NodeState>): void {
    const existing = this.nodes.get(id);
    if (existing) {
      this.nodes.set(id, { ...existing, ...updates });
      this.updateFieldState();
    }
  }

  removeNode(id: string): void {
    this.nodes.delete(id);
    // Remove related relations
    for (const [relId, relation] of this.relations) {
      if (relation.from === id || relation.to === id) {
        this.relations.delete(relId);
      }
    }
    this.updateFieldState();
  }

  // Relation management
  addRelation(relation: RelationState): void {
    validateRelation(relation);
    this.relations.set(relation.id, relation);
    this.updateFieldState();
  }

  updateRelation(id: string, updates: Partial<RelationState>): void {
    const existing = this.relations.get(id);
    if (existing) {
      const updated = { ...existing, ...updates };
      validateRelation(updated);
      this.relations.set(id, updated);
      this.updateFieldState();
    }
  }

  removeRelation(id: string): void {
    this.relations.delete(id);
    this.updateFieldState();
  }

  // Motif management
  addMotif(motif: MotifState): void {
    this.motifs.set(motif.id, motif);
    this.updateFieldState();
  }

  updateMotif(id: string, updates: Partial<MotifState>): void {
    const existing = this.motifs.get(id);
    if (existing) {
      this.motifs.set(id, { ...existing, ...updates });
      this.updateFieldState();
    }
  }

  removeMotif(id: string): void {
    this.motifs.delete(id);
    this.updateFieldState();
  }

  // Field state management
  private updateFieldState(): void {
    const previousState = { ...this.fieldState };

    // Calculate distribution
    const nodeCount = this.nodes.size;
    const activeNodes = Array.from(this.nodes.values()).filter(
      node => node.presence === 'present'
    ).length;
    this.fieldState.distribution = activeNodes > nodeCount * 0.7 ? 'clustered' : 'diffuse';

    // Calculate activity
    const recentRelations = Array.from(this.relations.values()).filter(
      rel => rel.recency === 'recent'
    ).length;
    this.fieldState.activity = recentRelations > 5 ? 'active' : 'quiet';

    // Calculate reciprocity
    const reciprocalRelations = Array.from(this.relations.values()).filter(
      rel => rel.mutuality === 'reciprocal'
    ).length;
    const totalRelations = this.relations.size;
    this.fieldState.reciprocity = reciprocalRelations > totalRelations * 0.5 ? 'high' : 'low';

    // Calculate emergence
    const emergingMotifs = Array.from(this.motifs.values()).filter(
      motif => motif.state === 'emerging'
    ).length;
    this.fieldState.emergence = emergingMotifs > 0 ? 'localized' : 'none';

    // Record transition
    this.fieldState.transitions.push({
      timestamp: Date.now(),
      from: previousState,
      to: { ...this.fieldState },
      triggeredBy: 'state_update'
    });

    // Keep only last 10 transitions
    if (this.fieldState.transitions.length > 10) {
      this.fieldState.transitions = this.fieldState.transitions.slice(-10);
    }
  }

  // Getters
  getNodes(): NodeState[] {
    return Array.from(this.nodes.values());
  }

  getRelations(): RelationState[] {
    return Array.from(this.relations.values());
  }

  getMotifs(): MotifState[] {
    return Array.from(this.motifs.values());
  }

  getFieldState(): FieldState {
    return { ...this.fieldState };
  }

  // Export/Import for persistence
  exportState(): {
    nodes: NodeState[];
    relations: RelationState[];
    motifs: MotifState[];
    fieldState: FieldState;
  } {
    return {
      nodes: this.getNodes(),
      relations: this.getRelations(),
      motifs: this.getMotifs(),
      fieldState: this.getFieldState()
    };
  }

  importState(state: {
    nodes: NodeState[];
    relations: RelationState[];
    motifs: MotifState[];
    fieldState: FieldState;
  }): void {
    this.nodes.clear();
    this.relations.clear();
    this.motifs.clear();

    state.nodes.forEach(node => this.nodes.set(node.id, node));
    state.relations.forEach(relation => this.relations.set(relation.id, relation));
    state.motifs.forEach(motif => this.motifs.set(motif.id, motif));
    this.fieldState = { ...state.fieldState };
  }
}