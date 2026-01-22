#!/usr/bin/env python3
"""
╔═══════════════════════════════════════════════════════════════════════════════╗
║                    QMIX 3-AGENT THEOREM - GRADIO SPACE                        ║
║                Interactive Multi-Agent RL Visualization                       ║
║                         Quantum Pi Forge                                      ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║  Educational demo: QMIX monotonic mixing preserves argmax alignment.          ║
║  Core insight: Decentralized execution with centralized training (CTDE).      ║
║  License: CC-BY-4.0                                                           ║
╚═══════════════════════════════════════════════════════════════════════════════╝
"""

import gradio as gr
import numpy as np
import matplotlib.pyplot as plt
from typing import Tuple, List
import warnings
warnings.filterwarnings('ignore')


# ============================================================================
# QMIX CORE FUNCTIONS
# ============================================================================

def compute_q_tot(
    q1: np.ndarray,
    q2: np.ndarray, 
    q3: np.ndarray,
    w1: float,
    w2: float,
    w3: float,
    bias: float = 0.0
) -> Tuple[np.ndarray, List[str]]:
    """
    Compute Q_tot for all 8 joint action combinations (3 agents, binary actions).
    
    QMIX Formula: Q_tot = w1*Q1(u1) + w2*Q2(u2) + w3*Q3(u3) + b
    
    Args:
        q1, q2, q3: Individual Q-values [Q(0), Q(1)] for each agent
        w1, w2, w3: Monotonic mixing weights (must be >= 0)
        bias: Bias term
    
    Returns:
        Tuple of (q_tot array, joint action labels)
    """
    joint_actions = []
    q_tot = np.zeros(8)
    
    for i in range(8):
        # Binary decomposition: i -> (u1, u2, u3)
        u1 = (i >> 2) & 1
        u2 = (i >> 1) & 1
        u3 = i & 1
        
        ja = f'({u1},{u2},{u3})'
        joint_actions.append(ja)
        
        # QMIX mixing
        q_tot[i] = w1 * q1[u1] + w2 * q2[u2] + w3 * q3[u3] + bias
    
    return q_tot, joint_actions


def verify_argmax_theorem(
    q1: np.ndarray,
    q2: np.ndarray,
    q3: np.ndarray,
    q_tot: np.ndarray
) -> Tuple[int, int, bool]:
    """
    Verify the QMIX theorem: greedy individual actions = optimal joint action.
    
    The theorem states that if mixer weights are monotonic (non-negative),
    then argmax_u Q_tot(u) = (argmax Q1, argmax Q2, argmax Q3).
    
    Returns:
        Tuple of (greedy_joint_index, global_argmax_index, match_bool)
    """
    # Individual greedy actions
    u1_star = np.argmax(q1)
    u2_star = np.argmax(q2)
    u3_star = np.argmax(q3)
    
    # Greedy joint index: binary encoding
    greedy_joint_index = (u1_star << 2) | (u2_star << 1) | u3_star
    
    # Global argmax
    global_argmax_index = np.argmax(q_tot)
    
    return greedy_joint_index, global_argmax_index, greedy_joint_index == global_argmax_index


def compute_swap_deltas(
    q1: np.ndarray,
    q2: np.ndarray,
    q3: np.ndarray,
    w1: float,
    w2: float,
    w3: float
) -> List[dict]:
    """
    Compute delta Q_tot for swapping each agent from action 0 to action 1.
    
    This demonstrates the monotonicity property: if w_i >= 0 and Q_i improves,
    then Q_tot cannot decrease.
    """
    deltas = []
    
    for name, q, w in [("Agent 1", q1, w1), ("Agent 2", q2, w2), ("Agent 3", q3, w3)]:
        delta_q = q[1] - q[0]  # Q(1) - Q(0)
        delta_qtot = w * delta_q
        
        deltas.append({
            "agent": name,
            "delta_q": delta_q,
            "weight": w,
            "delta_qtot": delta_qtot,
            "monotonic": delta_qtot >= 0 if delta_q >= 0 else True
        })
    
    return deltas


# ============================================================================
# VISUALIZATION FUNCTIONS
# ============================================================================

def create_visualization(
    q1_0: float, q1_1: float,
    q2_0: float, q2_1: float,
    q3_0: float, q3_1: float,
    w1: float, w2: float, w3: float
) -> Tuple[plt.Figure, str]:
    """
    Create the full QMIX visualization with theorem verification.
    """
    # Build Q-value arrays
    q1 = np.array([q1_0, q1_1])
    q2 = np.array([q2_0, q2_1])
    q3 = np.array([q3_0, q3_1])
    
    # Compute Q_tot
    q_tot, joint_actions = compute_q_tot(q1, q2, q3, w1, w2, w3)
    
    # Verify theorem
    greedy_idx, global_idx, match = verify_argmax_theorem(q1, q2, q3, q_tot)
    
    # Compute swap deltas
    deltas = compute_swap_deltas(q1, q2, q3, w1, w2, w3)
    
    # Create figure
    fig, axes = plt.subplots(1, 2, figsize=(14, 5))
    
    # Left Plot: Joint Q_tot values
    colors = ['#94a3b8'] * 8  # Slate 400
    colors[greedy_idx] = '#22c55e' if match else '#ef4444'  # Green if match, Red if not
    if not match:
        colors[global_idx] = '#f59e0b'  # Amber for actual argmax
    
    bars = axes[0].bar(joint_actions, q_tot, color=colors, edgecolor='#475569', linewidth=1.5)
    axes[0].set_title('Joint Q_tot for All Action Combinations', fontsize=14, fontweight='bold')
    axes[0].set_ylabel('$Q_{tot}$ Value', fontsize=12)
    axes[0].set_xlabel('Joint Action $\\mathbf{u}=(u_1, u_2, u_3)$', fontsize=12)
    axes[0].tick_params(axis='x', rotation=45)
    axes[0].grid(axis='y', linestyle='--', alpha=0.6)
    
    # Add value labels
    for bar, val in zip(bars, q_tot):
        axes[0].text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.05,
                     f'{val:.2f}', ha='center', va='bottom', fontsize=9)
    
    # Legend
    axes[0].axhline(y=q_tot[greedy_idx], color='#22c55e', linestyle='--', alpha=0.5, 
                    label=f'Greedy {joint_actions[greedy_idx]}')
    if not match:
        axes[0].axhline(y=q_tot[global_idx], color='#f59e0b', linestyle='--', alpha=0.5,
                        label=f'True Argmax {joint_actions[global_idx]}')
    axes[0].legend(loc='upper left')
    
    # Right Plot: Individual Q-values
    x = np.array([0, 1])
    bar_width = 0.25
    
    axes[1].bar(x - bar_width, q1, bar_width, label=f'Agent 1 (w={w1})', color='#3b82f6')
    axes[1].bar(x, q2, bar_width, label=f'Agent 2 (w={w2})', color='#8b5cf6')
    axes[1].bar(x + bar_width, q3, bar_width, label=f'Agent 3 (w={w3})', color='#06b6d4')
    
    axes[1].set_title('Individual Q-values $Q_i(u_i)$', fontsize=14, fontweight='bold')
    axes[1].set_ylabel('$Q_i$ Value', fontsize=12)
    axes[1].set_xticks(x)
    axes[1].set_xticklabels(['Action 0 (Bad)', 'Action 1 (Good)'])
    axes[1].legend()
    axes[1].grid(axis='y', linestyle='--', alpha=0.6)
    
    # Highlight argmax
    argmax_markers = [
        (0 - bar_width, q1[1]) if np.argmax(q1) == 1 else None,
        (0, q2[1]) if np.argmax(q2) == 1 else None,
        (0 + bar_width, q3[1]) if np.argmax(q3) == 1 else None,
    ]
    
    plt.tight_layout()
    
    # Build summary markdown
    theorem_status = "✅ **VERIFIED**" if match else "❌ **VIOLATED** (weights may not be monotonic)"
    
    summary = f"""
## 🎯 QMIX Theorem Verification

### Individual Greedy Actions
- **Agent 1**: argmax Q₁ = {np.argmax(q1)} (Q₁ = [{q1[0]:.1f}, {q1[1]:.1f}])
- **Agent 2**: argmax Q₂ = {np.argmax(q2)} (Q₂ = [{q2[0]:.1f}, {q2[1]:.1f}])
- **Agent 3**: argmax Q₃ = {np.argmax(q3)} (Q₃ = [{q3[0]:.1f}, {q3[1]:.1f}])

### Joint Action Analysis
- **Greedy Joint**: {joint_actions[greedy_idx]} → Q_tot = {q_tot[greedy_idx]:.2f}
- **Global Argmax**: {joint_actions[global_idx]} → Q_tot = {q_tot[global_idx]:.2f}

### Theorem Status: {theorem_status}

---

## 🔄 Monotonic Swap Analysis

Starting from suboptimal (0,0,0) with Q_tot = {q_tot[0]:.2f}:

| Agent | ΔQ_i | Weight | ΔQ_tot | Monotonic |
|-------|------|--------|--------|-----------|
"""
    
    for d in deltas:
        mono_icon = "✅" if d["monotonic"] else "⚠️"
        summary += f"| {d['agent']} | {d['delta_q']:+.1f} | {d['weight']:.2f} | {d['delta_qtot']:+.2f} | {mono_icon} |\n"
    
    summary += """

### 💡 Key Insight (CTDE)

**Centralized Training, Decentralized Execution**

If all mixing weights w_i ≥ 0 (monotonic), then improving any individual Q_i 
will never decrease Q_tot. This allows agents to act greedily on their own 
Q-values during execution while still optimizing the global objective.
"""
    
    return fig, summary


# ============================================================================
# GRADIO INTERFACE
# ============================================================================

with gr.Blocks(
    title="QMIX 3-Agent Theorem Visualization",
    theme=gr.themes.Soft(primary_hue="blue", secondary_hue="purple")
) as demo:
    
    gr.Markdown("""
    # 🎮 QMIX 3-Agent Argmax Proof Visualization
    
    **Interactive demonstration of the QMIX theorem for multi-agent reinforcement learning.**
    
    *Core insight: Monotonic mixing preserves individual argmax alignment with joint Q_tot argmax.*
    
    ---
    
    ## The QMIX Formula
    
    ```
    Q_tot(u) = w₁·Q₁(u₁) + w₂·Q₂(u₂) + w₃·Q₃(u₃) + b
    ```
    
    **Theorem**: If all weights w_i ≥ 0 (monotonic), then:
    ```
    argmax_u Q_tot(u) = (argmax Q₁, argmax Q₂, argmax Q₃)
    ```
    
    This enables **Centralized Training, Decentralized Execution (CTDE)**.
    """)
    
    with gr.Row():
        with gr.Column(scale=1):
            gr.Markdown("### Agent 1 Q-values")
            q1_0 = gr.Slider(0, 10, value=2.0, step=0.5, label="Q₁(0) - Bad Action")
            q1_1 = gr.Slider(0, 10, value=5.0, step=0.5, label="Q₁(1) - Good Action")
            
            gr.Markdown("### Agent 2 Q-values")
            q2_0 = gr.Slider(0, 10, value=3.0, step=0.5, label="Q₂(0) - Bad Action")
            q2_1 = gr.Slider(0, 10, value=4.0, step=0.5, label="Q₂(1) - Good Action")
            
            gr.Markdown("### Agent 3 Q-values")
            q3_0 = gr.Slider(0, 10, value=1.0, step=0.5, label="Q₃(0) - Bad Action")
            q3_1 = gr.Slider(0, 10, value=6.0, step=0.5, label="Q₃(1) - Good Action")
        
        with gr.Column(scale=1):
            gr.Markdown("### Mixer Weights")
            w1 = gr.Slider(-0.5, 1.0, value=0.4, step=0.05, label="w₁ (Agent 1 weight)")
            w2 = gr.Slider(-0.5, 1.0, value=0.3, step=0.05, label="w₂ (Agent 2 weight)")
            w3 = gr.Slider(-0.5, 1.0, value=0.3, step=0.05, label="w₃ (Agent 3 weight)")
            
            gr.Markdown("""
            ⚠️ **Try setting a weight negative** to see the theorem break!
            
            Negative weights violate monotonicity and can cause the 
            greedy joint action to differ from the global argmax.
            """)
            
            run_btn = gr.Button("🔄 Update Visualization", variant="primary", size="lg")
    
    with gr.Row():
        plot_output = gr.Plot(label="QMIX Visualization")
    
    with gr.Row():
        summary_output = gr.Markdown()
    
    # Wire up the button
    run_btn.click(
        fn=create_visualization,
        inputs=[q1_0, q1_1, q2_0, q2_1, q3_0, q3_1, w1, w2, w3],
        outputs=[plot_output, summary_output]
    )
    
    # Auto-update on any slider change
    for slider in [q1_0, q1_1, q2_0, q2_1, q3_0, q3_1, w1, w2, w3]:
        slider.change(
            fn=create_visualization,
            inputs=[q1_0, q1_1, q2_0, q2_1, q3_0, q3_1, w1, w2, w3],
            outputs=[plot_output, summary_output]
        )
    
    gr.Markdown("""
    ---
    
    ## 📚 What is QMIX?
    
    QMIX (Rashid et al., 2018) is a value decomposition method for cooperative 
    multi-agent reinforcement learning. Key properties:
    
    1. **Factored Q-values**: Each agent maintains its own Q-function
    2. **Monotonic Mixing**: Q_tot is a monotonic combination of individual Qs
    3. **Decentralized Execution**: Agents act greedily on local information
    4. **Centralized Training**: Global Q_tot used for backpropagation
    
    ### References
    
    - Rashid, T. et al. (2018). QMIX: Monotonic Value Function Factorisation for Deep Multi-Agent Reinforcement Learning
    - Sunehag, P. et al. (2017). Value-Decomposition Networks For Cooperative Multi-Agent Learning
    
    ---
    
    *Built with 🔮 by Quantum Pi Forge • T=∞ = T=0*
    """)


if __name__ == "__main__":
    demo.launch()
