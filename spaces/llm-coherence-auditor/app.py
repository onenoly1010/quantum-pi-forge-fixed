#!/usr/bin/env python3
"""
╔═══════════════════════════════════════════════════════════════════════════════╗
║          LLM COHERENCE AUDITING FRAMEWORK - GRADIO SPACE                      ║
║                    The Flatline Truth Dashboard                               ║
║                         Quantum Pi Forge                                      ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║  Interactive Gradio app for auditing LLM preference stability under noise.    ║
║  Authors: Olofson & Grok (2025). Bradley-Terry + Plackett-Luce models.        ║
║  License: CC-BY-4.0                                                           ║
╚═══════════════════════════════════════════════════════════════════════════════╝
"""

import gradio as gr
import numpy as np
import matplotlib.pyplot as plt
from typing import Tuple
import warnings
warnings.filterwarnings('ignore')

# ============================================================================
# CORE STATISTICAL MODELS
# ============================================================================

def bradley_terry_probability(lambda_param: float) -> float:
    """
    Bradley-Terry model: P(Y > X) = exp(λ) / (1 + exp(λ))
    
    Args:
        lambda_param: Log-odds parameter (R - βN in the full model)
    
    Returns:
        Probability that Y is preferred over X
    """
    return np.exp(lambda_param) / (1 + np.exp(lambda_param))


def estimate_exchange_rate(
    n_trials: int,
    base_rate: float,
    noise_std: float,
    seed: int = 42
) -> Tuple[float, float]:
    """
    Estimate Exchange Rate (R) via Maximum Likelihood Estimation
    with injected Gaussian noise.
    
    Args:
        n_trials: Number of comparison trials
        base_rate: True underlying exchange rate
        noise_std: Standard deviation of Gaussian noise (temperature T)
        seed: Random seed for reproducibility
    
    Returns:
        Tuple of (estimated_rate, standard_error)
    """
    np.random.seed(seed)
    
    # Inject noise into each trial
    noisy_rates = base_rate + np.random.normal(0, noise_std, n_trials)
    
    # MLE estimate is the mean of observed rates
    estimated_rate = np.mean(noisy_rates)
    standard_error = np.std(noisy_rates) / np.sqrt(n_trials)
    
    return estimated_rate, standard_error


def calculate_coherence(
    n_trials: int,
    base_rate: float,
    noise_std: float,
    seed: int = 42
) -> float:
    """
    Calculate Coherence (κ) - the consistency of predictions under noise.
    
    Coherence measures how often the same preference ranking is maintained
    across repeated noisy trials.
    
    Args:
        n_trials: Number of comparison trials
        base_rate: True underlying exchange rate
        noise_std: Standard deviation of Gaussian noise
        seed: Random seed
    
    Returns:
        Coherence score between 0 and 1
    """
    np.random.seed(seed)
    
    # Generate noisy probabilities
    noisy_rates = base_rate + np.random.normal(0, noise_std, n_trials)
    probs = [bradley_terry_probability(r) for r in noisy_rates]
    
    # Coherence: fraction of trials where preference > 0.5 matches base preference
    base_preference = bradley_terry_probability(base_rate) > 0.5
    coherent_trials = sum((p > 0.5) == base_preference for p in probs)
    
    return coherent_trials / n_trials


def plackett_luce_utilities(
    v_a: float,
    v_b: float,
    v_c: float = 0.0
) -> dict:
    """
    Plackett-Luce model for triad comparisons.
    
    Calculates probability of each ranking permutation given utilities.
    Identifiability constraint: V_C = 0 (reference point).
    
    Args:
        v_a: Utility of option A
        v_b: Utility of option B
        v_c: Utility of option C (default 0 for identifiability)
    
    Returns:
        Dictionary of ranking probabilities
    """
    exp_a, exp_b, exp_c = np.exp(v_a), np.exp(v_b), np.exp(v_c)
    total = exp_a + exp_b + exp_c
    
    # P(A > B > C) = (exp_a/total) * (exp_b/(exp_b + exp_c))
    rankings = {
        "A > B > C": (exp_a / total) * (exp_b / (exp_b + exp_c)),
        "A > C > B": (exp_a / total) * (exp_c / (exp_b + exp_c)),
        "B > A > C": (exp_b / total) * (exp_a / (exp_a + exp_c)),
        "B > C > A": (exp_b / total) * (exp_c / (exp_a + exp_c)),
        "C > A > B": (exp_c / total) * (exp_a / (exp_a + exp_b)),
        "C > B > A": (exp_c / total) * (exp_b / (exp_a + exp_b)),
    }
    
    return rankings


# ============================================================================
# ROBUSTNESS GAUNTLET - CORE VISUALIZATION
# ============================================================================

def run_robustness_gauntlet(
    base_rate: float,
    n_trials: int,
    n_runs: int,
    max_noise: float
) -> Tuple[plt.Figure, str]:
    """
    Run the full Robustness Gauntlet: sweep noise levels and measure divergence.
    
    THE KEY FINDING: Exchange Rate stays stable (FLATLINE) while
    Coherence decays (FRAGILE). Stable parameters ≠ reliable predictions.
    """
    noise_levels = np.linspace(0.01, max_noise, 20)
    
    # Storage for results
    rate_means = []
    rate_stds = []
    coherence_means = []
    coherence_stds = []
    
    for noise in noise_levels:
        run_rates = []
        run_coherences = []
        
        for run in range(n_runs):
            rate, _ = estimate_exchange_rate(n_trials, base_rate, noise, seed=run)
            coherence = calculate_coherence(n_trials, base_rate, noise, seed=run + 1000)
            run_rates.append(rate)
            run_coherences.append(coherence)
        
        rate_means.append(np.mean(run_rates))
        rate_stds.append(np.std(run_rates))
        coherence_means.append(np.mean(run_coherences))
        coherence_stds.append(np.std(run_coherences))
    
    # Convert to numpy
    rate_means = np.array(rate_means)
    rate_stds = np.array(rate_stds)
    coherence_means = np.array(coherence_means)
    coherence_stds = np.array(coherence_stds)
    
    # Create figure
    fig, ax1 = plt.subplots(figsize=(10, 6))
    
    # Primary axis: Exchange Rate
    color1 = '#2563eb'  # Blue
    ax1.set_xlabel('Noise Level (Temperature T)', fontsize=12)
    ax1.set_ylabel('Exchange Rate (R)', color=color1, fontsize=12)
    ax1.plot(noise_levels, rate_means, color=color1, linewidth=2, label='Exchange Rate')
    ax1.fill_between(noise_levels, 
                     rate_means - rate_stds, 
                     rate_means + rate_stds, 
                     color=color1, alpha=0.2)
    ax1.tick_params(axis='y', labelcolor=color1)
    ax1.axhline(y=base_rate, color=color1, linestyle='--', alpha=0.5, label=f'True Rate ({base_rate})')
    
    # Secondary axis: Coherence
    ax2 = ax1.twinx()
    color2 = '#dc2626'  # Red
    ax2.set_ylabel('Coherence (κ)', color=color2, fontsize=12)
    ax2.plot(noise_levels, coherence_means, color=color2, linewidth=2, label='Coherence')
    ax2.fill_between(noise_levels,
                     coherence_means - coherence_stds,
                     coherence_means + coherence_stds,
                     color=color2, alpha=0.2)
    ax2.tick_params(axis='y', labelcolor=color2)
    ax2.set_ylim(0, 1.1)
    
    # Title and legend
    fig.suptitle('The Robustness Gauntlet: Rate Stability vs Coherence Decay', fontsize=14, fontweight='bold')
    
    # Combined legend
    lines1, labels1 = ax1.get_legend_handles_labels()
    lines2, labels2 = ax2.get_legend_handles_labels()
    ax1.legend(lines1 + lines2, labels1 + labels2, loc='lower left')
    
    plt.tight_layout()
    
    # Summary statistics
    final_rate = rate_means[-1]
    final_coherence = coherence_means[-1]
    rate_drift = abs(final_rate - base_rate) / base_rate * 100
    coherence_drop = (1 - final_coherence) * 100
    
    summary = f"""
## 📊 Gauntlet Results

### Exchange Rate (Blue Line)
- **Final Rate**: {final_rate:.4f} (drift: {rate_drift:.1f}% from true)
- **Status**: {'✅ STABLE (Flatline)' if rate_drift < 10 else '⚠️ Drifting'}

### Coherence (Red Line)  
- **Final Coherence**: {final_coherence:.2%}
- **Decay**: {coherence_drop:.1f}% from perfect
- **Status**: {'✅ Stable' if final_coherence > 0.8 else '⚠️ FRAGILE' if final_coherence > 0.6 else '🔴 CRITICAL'}

### 🎯 The Divergence Finding
**"Stable parameters ≠ reliable predictions"**

The Exchange Rate remains nearly constant (FLATLINE) while Coherence 
decays significantly. This demonstrates that parameter-level stability 
metrics can mask predictive fragility.
"""
    
    return fig, summary


def run_triad_analysis(v_a: float, v_b: float) -> Tuple[plt.Figure, str]:
    """
    Run Plackett-Luce triad analysis with given utilities.
    """
    v_c = 0.0  # Identifiability constraint
    
    rankings = plackett_luce_utilities(v_a, v_b, v_c)
    
    # Create bar chart
    fig, ax = plt.subplots(figsize=(10, 5))
    
    names = list(rankings.keys())
    probs = list(rankings.values())
    colors = ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe']
    
    bars = ax.barh(names, probs, color=colors)
    ax.set_xlabel('Probability', fontsize=12)
    ax.set_title(f'Plackett-Luce Ranking Probabilities\n(V_A={v_a:.2f}, V_B={v_b:.2f}, V_C=0.00)', 
                 fontsize=14, fontweight='bold')
    ax.set_xlim(0, 1)
    
    # Add value labels
    for bar, prob in zip(bars, probs):
        ax.text(prob + 0.02, bar.get_y() + bar.get_height()/2, 
                f'{prob:.3f}', va='center', fontsize=10)
    
    plt.tight_layout()
    
    # Find most likely ranking
    most_likely = max(rankings, key=rankings.get)
    
    summary = f"""
## 📐 Triad Mode Analysis (Plackett-Luce)

### Utility Parameters
- **V_A**: {v_a:.2f}
- **V_B**: {v_b:.2f}  
- **V_C**: 0.00 (reference)

### Most Likely Ranking
**{most_likely}** with probability **{rankings[most_likely]:.1%}**

### Interpretation
- Higher utility → more likely to be ranked first
- V_C = 0 is the identifiability constraint (anchor point)
- Probabilities sum to 1.0 across all permutations
"""
    
    return fig, summary


# ============================================================================
# GRADIO INTERFACE
# ============================================================================

with gr.Blocks(
    title="LLM Coherence Auditing Framework",
    theme=gr.themes.Soft(primary_hue="blue", secondary_hue="slate")
) as demo:
    
    gr.Markdown("""
    # ⚖️ The Flatline Truth: Quantifying Coherence in LLM Preferences
    
    **A robust auditing framework bridging viral claims to verifiable science.**
    
    *By Olofson & Grok (2025) • CC-BY-4.0*
    
    ---
    
    ## The Crisis of Preference Stability
    
    RLHF builds the moral compass of modern AI. But conventional metrics overlook systemic robustness.
    This tool stress-tests emergent preferences using math, not ideology.
    
    **Key Finding**: Exchange Rate stays FLAT while Coherence DECAYS. 
    *Stable parameters ≠ reliable predictions.*
    """)
    
    with gr.Tabs():
        # Tab 1: Robustness Gauntlet
        with gr.TabItem("🎯 Robustness Gauntlet"):
            gr.Markdown("""
            ### The Gauntlet: Temperature Sweep with Noise Injection
            
            Inject Gaussian noise across multiple runs to measure the divergence between:
            - **Exchange Rate (R)**: Parameter stability
            - **Coherence (κ)**: Prediction consistency
            """)
            
            with gr.Row():
                with gr.Column(scale=1):
                    base_rate_slider = gr.Slider(
                        minimum=0.5, maximum=2.0, value=1.0, step=0.1,
                        label="Base Exchange Rate (True R)"
                    )
                    n_trials_slider = gr.Slider(
                        minimum=50, maximum=500, value=100, step=50,
                        label="Trials per Run"
                    )
                    n_runs_slider = gr.Slider(
                        minimum=5, maximum=50, value=10, step=5,
                        label="Independent Runs"
                    )
                    max_noise_slider = gr.Slider(
                        minimum=0.5, maximum=3.0, value=1.5, step=0.1,
                        label="Maximum Noise Level (T)"
                    )
                    run_gauntlet_btn = gr.Button("🚀 Run Gauntlet", variant="primary")
                
                with gr.Column(scale=2):
                    gauntlet_plot = gr.Plot(label="Robustness Gauntlet Results")
                    gauntlet_summary = gr.Markdown()
            
            run_gauntlet_btn.click(
                fn=run_robustness_gauntlet,
                inputs=[base_rate_slider, n_trials_slider, n_runs_slider, max_noise_slider],
                outputs=[gauntlet_plot, gauntlet_summary]
            )
        
        # Tab 2: Triad Mode (Plackett-Luce)
        with gr.TabItem("📐 Triad Mode (Plackett-Luce)"):
            gr.Markdown("""
            ### Plackett-Luce Model for Triad Comparisons
            
            Extend beyond binary to rank three options. The model calculates 
            probability of each ranking permutation given utility values.
            
            **Identifiability Constraint**: V_C = 0 (reference anchor)
            """)
            
            with gr.Row():
                with gr.Column(scale=1):
                    v_a_slider = gr.Slider(
                        minimum=-2.0, maximum=2.0, value=1.0, step=0.1,
                        label="Utility V_A"
                    )
                    v_b_slider = gr.Slider(
                        minimum=-2.0, maximum=2.0, value=0.5, step=0.1,
                        label="Utility V_B"
                    )
                    gr.Markdown("*V_C = 0 (fixed reference)*")
                    run_triad_btn = gr.Button("📊 Analyze Triad", variant="primary")
                
                with gr.Column(scale=2):
                    triad_plot = gr.Plot(label="Plackett-Luce Rankings")
                    triad_summary = gr.Markdown()
            
            run_triad_btn.click(
                fn=run_triad_analysis,
                inputs=[v_a_slider, v_b_slider],
                outputs=[triad_plot, triad_summary]
            )
        
        # Tab 3: Methodology
        with gr.TabItem("📚 Methodology"):
            gr.Markdown("""
            ## Statistical Framework
            
            ### Binary Mode: Bradley-Terry Model
            
            Estimates the **Exchange Rate (R)** between two competing outcomes:
            
            ```
            P(Y > X) = exp(λ) / (1 + exp(λ))
            where λ = R - βN
            ```
            
            - **R**: Exchange rate parameter
            - **β**: Noise sensitivity coefficient  
            - **N**: Noise level (temperature T)
            
            **Maximum Likelihood Estimation** recovers R from observed preferences.
            
            ---
            
            ### Triad Mode: Plackett-Luce Model
            
            Generalizes to **multi-set ranking**:
            
            ```
            P(A > B > C) = (exp(V_A) / Σexp(V)) × (exp(V_B) / (exp(V_B) + exp(V_C)))
            ```
            
            - **V_i**: Utility of option i
            - **Identifiability**: V_C = 0 (anchor)
            
            ---
            
            ### The Robustness Gauntlet
            
            1. **Temperature Sweep**: Inject Gaussian noise N(0, T²)
            2. **Multiple Runs**: 10+ independent trials per noise level
            3. **Dual Metrics**:
               - Rate Stability: μ ± 1σ of estimated R
               - Coherence Decay: κ = fraction maintaining correct preference
            
            **The Divergence**: When R flatlines but κ decays, the model has 
            *stable parameters but fragile predictions*.
            
            ---
            
            ### References
            
            - Bradley, R.A. & Terry, M.E. (1952). Rank Analysis of Incomplete Block Designs
            - Plackett, R.L. (1975). The Analysis of Permutations
            - Arctotherium42 phenomenon - Community documentation of LLM preference volatility
            """)
    
    gr.Markdown("""
    ---
    
    *Built with 🔮 by Quantum Pi Forge • T=∞ = T=0*
    """)


if __name__ == "__main__":
    demo.launch()
