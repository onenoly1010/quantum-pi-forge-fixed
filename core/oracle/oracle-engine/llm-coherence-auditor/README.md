---
title: LLM Coherence Auditing Framework
emoji: ⚖️
colorFrom: blue
colorTo: gray
sdk: gradio
sdk_version: 4.0.0
app_file: app.py
pinned: false
license: cc-by-4.0
short_description: The Flatline Truth - Auditing LLM preference stability
tags:
  - llm
  - rlhf
  - preference-learning
  - bradley-terry
  - plackett-luce
  - robustness
  - coherence
---

# ⚖️ LLM Coherence Auditing Framework

**The Flatline Truth: Quantifying Coherence in LLM Preferences**

A robust, open-source auditing framework bridging viral claims to verifiable science.

## 🎯 Key Finding

> **"Stable parameters ≠ reliable predictions"**

The Exchange Rate (R) remains nearly constant under noise (FLATLINE) while
Coherence (κ) decays significantly (FRAGILE). This demonstrates that
parameter-level stability metrics can mask predictive fragility.

## 📊 Features

### Robustness Gauntlet

- Temperature sweep with Gaussian noise injection
- 10+ independent runs per noise level
- Dual-axis visualization: Rate Stability vs Coherence Decay

### Triad Mode (Plackett-Luce)

- Multi-set ranking beyond binary comparisons
- Interactive utility sliders
- Full permutation probability breakdown

### Methodology

- **Bradley-Terry Model**: Binary preference estimation
- **Plackett-Luce Model**: Triad ranking analysis
- **MLE Estimation**: Maximum Likelihood parameter recovery

## 🔬 Statistical Models

### Bradley-Terry (Binary Mode)

```
P(Y > X) = exp(λ) / (1 + exp(λ))
where λ = R - βN
```

### Plackett-Luce (Triad Mode)

```
P(A > B > C) = (exp(V_A) / Σexp(V)) × (exp(V_B) / (exp(V_B) + exp(V_C)))
```

## 📚 References

- Bradley, R.A. & Terry, M.E. (1952). Rank Analysis of Incomplete Block Designs
- Plackett, R.L. (1975). The Analysis of Permutations
- Arctotherium42 phenomenon - Community documentation of LLM preference volatility

## 👥 Authors

**Olofson & Grok (2025)**

## 📄 License

CC-BY-4.0

---

_Built with 🔮 by Quantum Pi Forge • T=∞ = T=0_
