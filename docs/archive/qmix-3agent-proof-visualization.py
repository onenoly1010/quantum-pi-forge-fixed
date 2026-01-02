#!/usr/bin/env python3
"""
╔═══════════════════════════════════════════════════════════════════════════════╗
║                    QMIX 3-AGENT ARGMAX PROOF VISUALIZATION                    ║
║                         Quantum Pi Forge Archive                              ║
║                              T=∞ = T=0                                        ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║  Archive Note:                                                                 ║
║  QMIX theorem demonstration - monotonic mixing preserves individual argmax    ║
║  alignment with joint Q_tot argmax. Core insight for multi-agent value        ║
║  decomposition in decentralized execution with centralized training (CTDE).   ║
╚═══════════════════════════════════════════════════════════════════════════════╝
"""

import torch
import matplotlib.pyplot as plt
import numpy as np

# --- 1. Setup: Individual Q-values and Mixer Weights ---
# Individual Qs: Action 0 (bad), 1 (good)
q1 = torch.tensor([2.0, 5.0])  # Q1(0)=2, Q1(1)=5
q2 = torch.tensor([3.0, 4.0])  # Q2(0)=3, Q2(1)=4
q3 = torch.tensor([1.0, 6.0])  # Q3(0)=1, Q3(1)=6

# Monotonic mixer weights (w_i >= 0)
w1, w2, w3 = 0.4, 0.3, 0.3
b = 0.0 # Bias term (set to zero for simplicity)

# --- 2. Calculate Q_tot for All Joint Actions ---
joint_actions = []
q_tot = torch.zeros(8)
for i in range(8):
    # Binary decomposition of index i: (u1, u2, u3)
    u1 = (i >> 2) & 1
    u2 = (i >> 1) & 1
    u3 = i & 1
    ja = f'({u1},{u2},{u3})'
    joint_actions.append(ja)
    # Q_tot = w1*Q1 + w2*Q2 + w3*Q3 + b
    q_tot[i] = w1 * q1[u1] + w2 * q2[u2] + w3 * q3[u3] + b

# --- 3. Verification of Argmax Match (The Theorem) ---
print("--- Q_tot Values and Argmax Verification ---")
for ja, qt in zip(joint_actions, q_tot):
    print(f"Q_tot{ja}: {qt.item():.2f}")

# The greedy joint action from individual argmaxes is (1,1,1), which is index 7
greedy_joint_index = 7
print(f"\nGreedy Joint: {joint_actions[greedy_joint_index]}, Q_tot={q_tot[greedy_joint_index].item():.2f}")
print(f"Global Argmax: {joint_actions[q_tot.argmax().item()]}, Q_tot={q_tot.max().item():.2f}")
print("Match (QMIX Theorem): ", "**Yes**" if q_tot.argmax() == greedy_joint_index else "**No**")


# --- 4. Proof Illustration: Swap Demonstration ---
print("\n--- Proof Demo: Monotonic Swaps from Suboptimal (0,0,0) ---")
# Start at (0,0,0) with Q_tot = 2.00
initial_q_tot = q_tot[0].item() 
print(f"Starting Q_tot((0,0,0)) = {initial_q_tot:.2f}")

delta_q1 = q1[1] - q1[0] 
delta_qtot_swap1 = w1 * delta_q1
print(f"Swap u1 0->1: ΔQ1={delta_q1:.1f}, w1={w1}, ΔQ_tot={delta_qtot_swap1:.2f} (>=0)")

delta_q2 = q2[1] - q2[0] 
delta_qtot_swap2 = w2 * delta_q2
print(f"Swap u2 0->1: ΔQ2={delta_q2:.1f}, w2={w2}, ΔQ_tot={delta_qtot_swap2:.2f} (>=0)")

delta_q3 = q3[1] - q3[0] 
delta_qtot_swap3 = w3 * delta_q3
print(f"Swap u3 0->1: ΔQ3={delta_q3:.1f}, w3={w3}, ΔQ_tot={delta_qtot_swap3:.2f} (>=0)")
print("Conclusion: Since all weights are non-negative, any improvement in an individual Q_i leads to a non-decreasing Q_tot.")


# --- 5. Visualization Generation ---
fig, ax = plt.subplots(1, 2, figsize=(12, 5))

# Left Plot: Joint Q_tot
ax[0].bar(joint_actions, q_tot)
ax[0].set_title('Joint Q_tot for All Action Combinations', fontsize=14)
ax[0].set_ylabel('$Q_{\\text{tot}}$ Value')
ax[0].set_xlabel('Joint Action $\mathbf{u}=(u_1, u_2, u_3)$')
plt.setp(ax[0].get_xticklabels(), rotation=45, ha='right')
ax[0].grid(axis='y', linestyle='--', alpha=0.6)

# Right Plot: Individual Q-values
u_labels = ['Action 0 (Bad)', 'Action 1 (Good)']
x = np.arange(len(u_labels))
bar_width = 0.25

# Plotting with offset for grouped bars
ax[1].bar(x - bar_width, q1, bar_width, label='Agent 1', color='C0')
ax[1].bar(x, q2, bar_width, label='Agent 2', color='C1', alpha=0.7)
ax[1].bar(x + bar_width, q3, bar_width, label='Agent 3', color='C2', alpha=0.5)

ax[1].set_title('Individual Q-values $Q_i(u_i)$', fontsize=14)
ax[1].set_ylabel('$Q_i$ Value')
ax[1].set_xticks(x)
ax[1].set_xticklabels(u_labels)
ax[1].legend()
ax[1].grid(axis='y', linestyle='--', alpha=0.6)

plt.tight_layout()
plt.savefig('qmix_3agent_proof_viz.png')
print("\nPlot saved as 'qmix_3agent_proof_viz.png' .")
