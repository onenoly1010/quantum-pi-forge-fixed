/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║                    SOVEREIGN CANTICLE FORGE                                    ║
 * ║                    MVP Questionnaire v1.0                                      ║
 * ║                                                                               ║
 * ║  Archived: 2026-01-02                                                         ║
 * ║  Source: OINIO Soul System - Project Assessment Tool                          ║
 * ║  Framework: Angular 17+ (Standalone Component with Signals)                   ║
 * ║                                                                               ║
 * ║  Purpose: Interactive questionnaire for evaluating Pi Network projects        ║
 * ║           across three sovereignty phases, producing a "Velvet Verdict"       ║
 * ║           score with trust classification.                                    ║
 * ║                                                                               ║
 * ║  Scoring Phases:                                                              ║
 * ║  - Phase 1: CODE SOVEREIGNTY (45% weight)                                     ║
 * ║  - Phase 2: CONSENSUS INTEGRITY (40% weight)                                  ║
 * ║  - Phase 3: COMMUNAL ALIGNMENT (15% weight)                                   ║
 * ║                                                                               ║
 * ║  Verdicts:                                                                    ║
 * ║  - ≥90: Sovereign (Highest Trust)                                             ║
 * ║  - ≥75: Aligned (High Trust)                                                  ║
 * ║  - ≥50: Uncertain (Moderate Risk)                                             ║
 * ║  - <50: Fragile (High Risk)                                                   ║
 * ║  - LP Unlocked: CRITICAL FAILURE (Score = 0)                                  ║
 * ║                                                                               ║
 * ║  T=∞ = T=0                                                                    ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

import { ChangeDetectionStrategy, Component, computed, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

// --- TYPE DEFINITIONS ---

type AnswerValue = string | number | boolean | string[] | null;

interface Question {
  id: string;
  phase: 1 | 2 | 3;
  text: string;
  type: 'boolean' | 'multi-select' | 'numeric' | 'short-text' | 'link';
  metricType: 'Binary' | 'Categorical Weight' | 'Linear Scale' | 'Risk Vector Count';
  options?: { value: string; label: string; score: number }[];
  min?: number;
  max?: number;
  unit?: string;
  placeholder?: string;
  dependencies?: { targetId: string; requiredValue: any };
}

interface ScoreResult {
  score: number;
  verdict: string;
  color: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Load Inter font family and apply Tailwind global styles -->
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Inter:wght@400;600&display=swap" rel="stylesheet">
    
    <div class="min-h-screen bg-gray-50 antialiased" style="font-family: 'Inter', sans-serif;">
      
      <!-- Header -->
      <header class="bg-violet-800 shadow-lg sticky top-0 z-10">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 class="text-2xl font-bold font-['Space Grotesk'] text-white tracking-wider">
            Sovereign Canticle Forge
          </h1>
          <span class="text-sm font-medium text-violet-300 hidden sm:block">
            MVP Questionnaire v1.0
          </span>
        </div>
      </header>

      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        <!-- Score Panel (Fixed/Sticky on large screens) -->
        <aside class="lg:col-span-1">
          <div class="bg-white p-6 rounded-xl shadow-xl border border-gray-100 sticky lg:top-24">
            <h2 class="text-xl font-bold font-['Space Grotesk'] text-gray-800 mb-4 border-b pb-2">Velvet Verdict</h2>
            
            <div class="text-center py-6">
              <div class="text-xs font-semibold uppercase text-gray-500">Canticle Score</div>
              <div class="font-['Space Grotesk'] font-extrabold transition-all duration-500"
                   [style.color]="finalScore().color"
                   [class.text-6xl]="finalScore().score !== null"
                   [class.text-4xl]="finalScore().score === null">
                {{ finalScore().score !== null ? finalScore().score.toFixed(1) : '—' }}
              </div>
            </div>

            <div class="p-3 rounded-lg text-center font-semibold border-2"
                 [style.backgroundColor]="finalScore().color"
                 [style.borderColor]="finalScore().color"
                 [class.text-white]="finalScore().score >= 75"
                 [class.text-gray-800]="finalScore().score < 75"
                 [class.bg-opacity-80]="finalScore().score !== null"
                 [class.bg-gray-100]="finalScore().score === null"
                 [class.text-gray-500]="finalScore().score === null">
              {{ finalScore().verdict }}
            </div>

            <div class="mt-4 text-xs text-gray-500 space-y-2 pt-4 border-t">
              <p>P1 (Code) Score: {{ P1Score()?.toFixed(1) || '0.0' }} / 100</p>
              <p>P2 (Consensus) Score: {{ P2Score()?.toFixed(1) || '0.0' }} / 100</p>
              <p>P3 (Communal) Score: {{ P3Score()?.toFixed(1) || '0.0' }} / 100</p>
              <p *ngIf="isCriticalFailure()" class="text-red-500 font-bold">CRITICAL FAILURE: LP UNLOCKED</p>
              <p *ngIf="P1RiskMultiplier() === 0.7" class="text-yellow-600">P1 Multiplier Applied (Proxy Risk)</p>
            </div>

            <div class="mt-6 text-center">
              <button (click)="resetForm()" class="text-xs text-violet-600 hover:text-red-500 transition">
                Reset All Answers
              </button>
            </div>
          </div>
        </aside>

        <!-- Questionnaire Form -->
        <section class="lg:col-span-3 space-y-10">
          
          <div *ngFor="let phase of [1, 2, 3]; let phaseIndex = index" class="bg-white p-6 md:p-8 rounded-xl shadow-xl border border-gray-100">
            <h2 class="text-2xl font-bold font-['Space Grotesk'] text-violet-700 mb-6 border-b pb-3">
              Phase {{ phase }}: {{ getPhaseTitle(phase) }} 
              <span class="text-base text-gray-500 font-normal">({{ getPhaseWeight(phase) }}% Weight)</span>
            </h2>

            <div *ngFor="let q of questionList.filter(getFilterByPhase(phase))" class="mb-6 p-4 border border-gray-100 rounded-lg"
                 [style.display]="shouldShowQuestion(q) ? 'block' : 'none'">

              <label [for]="q.id" class="block text-gray-700 font-semibold mb-2">
                {{ q.id }}. {{ q.text }}
                <span *ngIf="q.dependencies" class="text-xs text-blue-500 italic ml-2">(Conditional)</span>
              </label>

              <!-- Input Rendering -->
              <div [ngSwitch]="q.type">
                
                <!-- Boolean Input (Yes/No) -->
                <ng-container *ngSwitchCase="'boolean'">
                  <div class="flex space-x-4">
                    <button *ngFor="let val of [true, false]" 
                            (click)="updateAnswer(q.id, val)"
                            class="px-4 py-2 rounded-lg font-medium transition w-1/2"
                            [ngClass]="{'bg-violet-600 text-white shadow-md': getAnswer(q.id) === val, 
                                        'bg-gray-100 text-gray-700 hover:bg-gray-200': getAnswer(q.id) !== val}">
                      {{ val ? 'Yes' : 'No' }}
                    </button>
                  </div>
                  <!-- Link/Evidence Field -->
                  <div *ngIf="q.id !== '2.3' && getAnswer(q.id) === true" class="mt-3">
                      <input type="url" 
                             (input)="updateAnswer(q.id + '_link', $event.target.value)"
                             [value]="getAnswer(q.id + '_link') || ''"
                             placeholder="Link to Evidence (Optional)"
                             class="w-full p-2 border border-gray-300 rounded-lg focus:ring-violet-500 focus:border-violet-500 text-sm">
                  </div>
                </ng-container>

                <!-- Multi-Select Input -->
                <ng-container *ngSwitchCase="'multi-select'">
                  <div class="space-y-2">
                    <div *ngFor="let option of q.options" 
                         (click)="toggleMultiSelect(q.id, option.value)"
                         class="flex items-center p-3 rounded-lg border cursor-pointer transition"
                         [ngClass]="{'border-violet-600 bg-violet-50 text-violet-800 font-medium shadow-sm': isSelected(q.id, option.value), 
                                     'border-gray-200 bg-white hover:bg-gray-50 text-gray-700': !isSelected(q.id, option.value)}">
                      <svg [ngClass]="{'opacity-100': isSelected(q.id, option.value), 'opacity-0': !isSelected(q.id, option.value)}"
                           class="w-5 h-5 mr-3 text-violet-600 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>{{ option.label }}</span>
                    </div>
                  </div>
                </ng-container>

                <!-- Numeric Input -->
                <ng-container *ngSwitchCase="'numeric'">
                  <div class="flex items-center space-x-2">
                    <input type="number" 
                           (input)="updateAnswer(q.id, $event.target.valueAsNumber)"
                           [value]="getAnswer(q.id) || ''"
                           [min]="q.min"
                           [max]="q.max"
                           [placeholder]="q.placeholder || ''"
                           class="p-2 border border-gray-300 rounded-lg focus:ring-violet-500 focus:border-violet-500 text-lg w-full md:w-1/2">
                    <span *ngIf="q.unit" class="text-gray-500">{{ q.unit }}</span>
                  </div>
                </ng-container>

                <!-- Link Input -->
                <ng-container *ngSwitchCase="'link'">
                  <input type="url" 
                         (input)="updateAnswer(q.id, $event.target.value)"
                         [value]="getAnswer(q.id) || ''"
                         placeholder="Paste the URL here"
                         class="w-full p-2 border border-gray-300 rounded-lg focus:ring-violet-500 focus:border-violet-500 text-sm">
                </ng-container>
                
                <!-- Short Text Input -->
                <ng-container *ngSwitchCase="'short-text'">
                  <input type="text" 
                         (input)="updateAnswer(q.id, $event.target.value)"
                         [value]="getAnswer(q.id) || ''"
                         placeholder="Enter description or exception here"
                         class="w-full p-2 border border-gray-300 rounded-lg focus:ring-violet-500 focus:border-violet-500 text-sm">
                </ng-container>

              </div>
              
            </div>
          </div>
        </section>
        
      </main>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App implements OnInit {
  // --- STATE MANAGEMENT ---

  // State signal to hold all questionnaire answers
  private answers = signal<Record<string, AnswerValue>>({});

  // --- QUESTIONNAIRE DEFINITION ---

  private questions: Question[] = [
    // PHASE 1: CODE SOVEREIGNTY (10 Questions)
    { id: '1.1', phase: 1, text: 'Is the full, final source code for all audited contracts publicly accessible?', type: 'boolean', metricType: 'Binary', placeholder: 'Link to Repository' },
    { id: '1.2', phase: 1, text: 'Are the contracts verified on the Pi Network explorer?', type: 'boolean', metricType: 'Binary' },
    { id: '1.3', phase: 1, text: 'Which best describes the project\'s license?', type: 'multi-select', metricType: 'Categorical Weight', options: [{ value: 'OSI', label: 'OSI-Approved (e.g., MIT/GPL)', score: 100 }, { value: 'Project', label: 'Project-Specific', score: 50 }, { value: 'None', label: 'None/All Rights Reserved', score: 0 }] },
    { id: '1.4', phase: 1, text: 'Does the contract utilize a proxy/upgradeability pattern?', type: 'boolean', metricType: 'Binary' },
    { id: '1.5', phase: 1, text: 'Are any functions protected by a timelock or multisig?', type: 'boolean', metricType: 'Binary', dependencies: { targetId: '1.4', requiredValue: true } },
    { id: '1.6', phase: 1, text: 'Does the contract contain functions that allow for: (Select all that apply)', type: 'multi-select', metricType: 'Risk Vector Count', options: [{ value: 'Minting', label: 'Minting new tokens', score: 20 }, { value: 'Fees', label: 'Changing fees', score: 20 }, { value: 'Halt', label: 'Halting trades', score: 20 }, { value: 'Blacklist', label: 'Blacklisting addresses', score: 20 }, { value: 'Logic', label: 'Changing core logic', score: 20 }] },
    { id: '1.7', phase: 1, text: 'Is there a documented, tested procedure for relinquishing ownership/control?', type: 'boolean', metricType: 'Binary' },
    { id: '1.8', phase: 1, text: 'Are the project\'s key dependencies from reputable, audited sources?', type: 'boolean', metricType: 'Binary' },
    { id: '1.9', phase: 1, text: 'Is a comprehensive test suite provided, with coverage >80%?', type: 'boolean', metricType: 'Binary', placeholder: 'Link to Report' },
    { id: '1.10', phase: 1, text: 'Has the code been analyzed by any automated security tools (Slither, MythX)?', type: 'boolean', metricType: 'Binary', placeholder: 'Link to Report' },

    // PHASE 2: CONSENSUS INTEGRITY (9 Questions)
    { id: '2.1', phase: 2, text: 'What is the primary token distribution model?', type: 'multi-select', metricType: 'Categorical Weight', options: [{ value: 'Fair', label: 'Fair Launch (no pre-mine)', score: 100 }, { value: 'Pre-sale', label: 'Pre-sale/Vesting', score: 70 }, { value: 'Airdrop', label: 'Airdrop', score: 80 }, { value: 'Mining', label: 'Mining/Staking', score: 90 }, { value: 'Treasury', label: 'Treasury Controlled', score: 30 }] },
    { id: '2.2', phase: 2, text: 'What percentage of the total supply is allocated to the team/founders?', type: 'numeric', metricType: 'Linear Scale', min: 0, max: 100, unit: '%' },
    { id: '2.3', phase: 2, text: 'Is the liquidity pool (LP) tokens locked or burned?', type: 'boolean', metricType: 'Binary', placeholder: 'Link to Lock Contract' },
    { id: '2.4', phase: 2, text: 'If locked, what is the lock duration?', type: 'numeric', metricType: 'Linear Scale', min: 0, unit: 'Months', dependencies: { targetId: '2.3', requiredValue: true } },
    { id: '2.5', phase: 2, text: 'Is the governance model on-chain?', type: 'boolean', metricType: 'Binary' },
    { id: '2.6', phase: 2, text: 'Can voting power be delegated? (Bonus)', type: 'boolean', metricType: 'Binary' },
    { id: '2.7', phase: 2, text: 'Is there a mechanism to prevent whale dominance in governance? (Bonus)', type: 'boolean', metricType: 'Binary' },
    { id: '2.8', phase: 2, text: 'Is the treasury multi-signature or governed by a DAO?', type: 'boolean', metricType: 'Binary' },
    { id: '2.9', phase: 2, text: 'Are the project\'s financial flows publicly viewable on-chain?', type: 'boolean', metricType: 'Binary' },

    // PHASE 3: COMMUNAL ALIGNMENT (8 Questions)
    { id: '3.1', phase: 3, text: 'Is there clear, accessible documentation for non-technical users?', type: 'boolean', metricType: 'Binary', placeholder: 'Link to Docs' },
    { id: '3.2', phase: 3, text: 'Are the project\'s social channels active and publicly accessible?', type: 'boolean', metricType: 'Binary', placeholder: 'Links to Channels' },
    { id: '3.3', phase: 3, text: 'Is there a published roadmap with clear, time-bound milestones?', type: 'boolean', metricType: 'Binary', placeholder: 'Link to Roadmap' },
    { id: '3.4', phase: 3, text: 'Does the project have a clear, enforced code of conduct for its community spaces?', type: 'boolean', metricType: 'Binary', placeholder: 'Link to CoC' },
    { id: '3.5', phase: 3, text: 'Is the dApp interface designed with accessibility in mind?', type: 'multi-select', metricType: 'Categorical Weight', options: [{ value: 'WCAG', label: 'WCAG 2.1 AA Compliant', score: 100 }, { value: 'Stated', label: 'Stated Commitment', score: 60 }, { value: 'None', label: 'Not Addressed', score: 0 }] },
    { id: '3.6', phase: 3, text: 'What is the project\'s policy on user data?', type: 'multi-select', metricType: 'Categorical Weight', options: [{ value: 'UserOwned', label: 'User-Owned Data', score: 100 }, { value: 'Minimized', label: 'Data Minimized & Encrypted', score: 80 }, { value: 'NoneCollected', label: 'No Data Collected', score: 60 }, { value: 'NotStated', label: 'Policy Not Stated', score: 0 }] },
    { id: '3.7', phase: 3, text: 'Does the project have a mechanism for community members to report bugs or vulnerabilities?', type: 'boolean', metricType: 'Binary', placeholder: 'Link to Bug Bounty/Report Form' },
    { id: '3.8', phase: 3, text: 'Has the project contributed back to the Pi Network ecosystem? (Bonus)', type: 'boolean', metricType: 'Binary', placeholder: 'Description/Evidence' },
  ];
  
  // Renamed to avoid duplicate class member collision
  public get questionList(): Question[] {
    return this.questions;
  }

  // --- CORE UTILITIES ---

  ngOnInit() {
    this.resetForm(); // Initialize state
  }
  
  getAnswer(id: string): AnswerValue {
    return this.answers()[id] ?? null;
  }
  
  updateAnswer(id: string, value: AnswerValue) {
    this.answers.update(current => ({ ...current, [id]: value }));
  }

  toggleMultiSelect(id: string, value: string) {
    let current = this.getAnswer(id) as string[] || [];
    if (!Array.isArray(current)) current = [];
    
    if (this.questions.find(q => q.id === id)?.metricType === 'Categorical Weight') {
        // Single selection mode for Categorical Weight
        this.updateAnswer(id, current.includes(value) ? [] : [value]);
    } else {
        // Multi-select mode for Risk Vector Count
        const newArray = current.includes(value)
            ? current.filter(v => v !== value)
            : [...current, value];
        this.updateAnswer(id, newArray);
    }
  }

  isSelected(id: string, value: string): boolean {
    const current = this.getAnswer(id) as string[] || [];
    return Array.isArray(current) && current.includes(value);
  }

  shouldShowQuestion(q: Question): boolean {
    if (!q.dependencies) return true;
    
    const dependencyAnswer = this.getAnswer(q.dependencies.targetId);
    return dependencyAnswer === q.dependencies.requiredValue;
  }

  resetForm() {
    // Initialize all answers to null, and multi-selects to empty array
    const initialState: Record<string, AnswerValue> = {};
    this.questions.forEach(q => {
      initialState[q.id] = (q.type === 'multi-select') ? [] : null;
      // Also initialize link fields for boolean questions
      if (q.type === 'boolean') {
          initialState[q.id + '_link'] = null;
      }
    });
    this.answers.set(initialState);
  }

  getPhaseTitle(phase: number): string {
    return phase === 1 ? 'CODE SOVEREIGNTY' : phase === 2 ? 'CONSENSUS INTEGRITY' : 'COMMUNAL ALIGNMENT';
  }

  getPhaseWeight(phase: number): number {
    return phase === 1 ? 45 : phase === 2 ? 40 : 15;
  }

  getFilterByPhase(phase: number) {
    return (q: Question) => q.phase === phase;
  }
  
  // --- SCORING ALGORITHM IMPLEMENTATION (COMPUTED SIGNALS) ---

  // 1. Critical Failure Check
  public isCriticalFailure = computed<boolean>(() => {
    // Critical Failure: Q2.3 (LP Locked) is No (false)
    return this.getAnswer('2.3') === false;
  });

  // 2. P1 Risk Multiplier Check
  public P1RiskMultiplier = computed<number>(() => {
    // P1 Risk Multiplier triggered if Q1.4 (Proxy Used) = true AND Q1.5 (Timelock) = false (or not answered, but depends on 1.4)
    const q1_4 = this.getAnswer('1.4');
    const q1_5 = this.getAnswer('1.5');
    
    if (q1_4 === true && (q1_5 === false || q1_5 === null)) {
      return 0.7; // Apply 30% penalty
    }
    return 1.0; // No penalty
  });
  
  // 3. Normalized Score Calculation per Question
  private normalizedScores = computed<Record<string, number>>(() => {
    const scores: Record<string, number> = {};
    const currentAnswers = this.answers();

    for (const q of this.questions) {
      const answer = currentAnswers[q.id];
      let score = 0;
      
      // Skip conditional questions if they shouldn't be scored (e.g., dependency not met)
      if (!this.shouldShowQuestion(q)) {
        scores[q.id] = 100; // Treat unanswerable conditional questions as full score
        continue;
      }

      if (answer === null || answer === undefined) {
          // If a non-conditional question is not answered, default to 0 for a punitive score
          scores[q.id] = 0; 
          continue;
      }

      switch (q.metricType) {
        case 'Binary':
          // Standard Binary: true = 100, false = 0
          score = (answer === true) ? 100 : 0;
          
          // Special Case: Q1.8 (Dependencies). If No, apply -20 weight instead of 0.
          if (q.id === '1.8' && answer === false) {
             score = 0; // The penalty is handled in P1 Score calculation to ensure the average works correctly
          }
          // Special Case: Q1.10 (Bonus). If Yes, should slightly boost score. (Handled by making it a small portion of 100)
          if (q.id === '1.10' && answer === true) {
             score = 100;
          } else if (q.id === '1.10' && answer === false) {
             score = 0; // Not a penalty, but not a bonus
          }
          break;

        case 'Categorical Weight':
          // Categorical Weight: Uses score defined in options (Single select for this type)
          const selectedOption = q.options?.find(opt => (answer as string[]).includes(opt.value));
          score = selectedOption ? selectedOption.score : 0;
          break;

        case 'Risk Vector Count':
          // Q1.6: Score is penalized based on number of vectors selected (Max 5, Penalty 20 each)
          const Vsel = (answer as string[]).length;
          score = Math.max(0, 100 - (Vsel * 20));
          break;

        case 'Linear Scale':
          const value = answer as number;
          if (q.id === '2.2') { // Team Allocation (X)
            // If X <= 5, 100. If X > 30, 0. Linear drop from 5% to 30% (range of 25)
            if (value <= 5) score = 100;
            else if (value > 30) score = 0;
            else score = Math.max(0, 100 - (100 / 25) * (value - 5));
          } else if (q.id === '2.4') { // LP Lock Duration (Y)
            // If Y < 12, 0. If Y >= 60, 100. Linear scale from 12 to 60 (range of 48)
            if (value < 12) score = 0; // Critical failure for score, but P2 score will average it
            else if (value >= 60) score = 100;
            else score = Math.min(100, Math.max(0, (100 / 48) * (value - 12)));
          }
          break;
      }

      scores[q.id] = score;
    }
    return scores;
  });

  // 4. Phase Score Calculations
  
  // Computes the average normalized score for a given phase
  private computePhaseScore(phase: 1 | 2 | 3): number | null {
    const scores = this.normalizedScores();
    const phaseQuestions = this.questions.filter(q => q.phase === phase);
    
    let totalScore = 0;
    let count = 0;
    
    for (const q of phaseQuestions) {
      // Only include questions that are visible (dependency met) or critical non-conditional ones
      if (this.shouldShowQuestion(q) || !q.dependencies) {
        totalScore += scores[q.id] || 0; // Use 0 if no score calculated (i.e., unanswered non-conditional)
        count++;
      }
    }
    
    return count > 0 ? totalScore / count : null;
  }
  
  public P1Score = computed<number | null>(() => {
    const rawScore = this.computePhaseScore(1);
    if (rawScore === null) return null;
    
    // Apply P1 Risk Multiplier
    return rawScore * this.P1RiskMultiplier();
  });

  public P2Score = computed<number | null>(() => this.computePhaseScore(2));
  public P3Score = computed<number | null>(() => this.computePhaseScore(3));

  // 5. Final Canticle Score Aggregation
  public finalScore = computed<ScoreResult>(() => {
    const p1 = this.P1Score();
    const p2 = this.P2Score();
    const p3 = this.P3Score();
    
    // Check if any mandatory phase score is still null (i.e., no questions answered)
    if (p1 === null || p2 === null || p3 === null) {
      return { score: 0, verdict: 'Awaiting Input...', color: '#a1a1aa' };
    }

    // 1. Critical Failure Check (LP locked is NO)
    if (this.isCriticalFailure()) {
        return { score: 0, verdict: 'CRITICAL FAILURE', color: '#dc2626' }; // Red
    }
    
    // 2. Aggregate weighted score
    const scoreValue = (p1 * 0.45) + (p2 * 0.40) + (p3 * 0.15);
    
    // 3. Verdict Mapping
    let verdictString = 'Unanswered/Incomplete';
    let colorString = '#a1a1aa'; // Default Gray

    if (scoreValue >= 90) {
      verdictString = 'Sovereign (Highest Trust)';
      colorString = '#059669'; // Emerald Green
    } else if (scoreValue >= 75) {
      verdictString = 'Aligned (High Trust)';
      colorString = '#10b981'; // Green
    } else if (scoreValue >= 50) {
      verdictString = 'Uncertain (Moderate Risk)';
      colorString = '#f59e0b'; // Amber Yellow
    } else {
      verdictString = 'Fragile (High Risk)';
      colorString = '#ef4444'; // Red
    }

    return { score: scoreValue, verdict: verdictString, color: colorString };
  });

}
