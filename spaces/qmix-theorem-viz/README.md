---
title: QMIX 3-Agent Theorem Visualization
emoji: 🎮
colorFrom: blue
colorTo: indigo
sdk: gradio
sdk_version: 4.0.0
app_file: app.py
pinned: false
license: cc-by-4.0
short_description: Interactive QMIX multi-agent RL theorem proof
tags:
  - reinforcement-learning
  - multi-agent
  - qmix
  - value-decomposition
  - ctde
  - marl
---

# 🎮 QMIX 3-Agent Theorem Visualization

**Interactive demonstration of the QMIX theorem for multi-agent reinforcement learning.**

## 🎯 Core Insight

> **Monotonic mixing preserves individual argmax alignment with joint Q_tot argmax.**

This enables **Centralized Training, Decentralized Execution (CTDE)**.

## 📐 The QMIX Formula

```
Q_tot(u) = w₁·Q₁(u₁) + w₂·Q₂(u₂) + w₃·Q₃(u₃) + b
```

**Theorem**: If all weights w_i ≥ 0 (monotonic), then:
```
argmax_u Q_tot(u) = (argmax Q₁, argmax Q₂, argmax Q₃)
```

## 🔧 Features

- **Interactive Q-value sliders**: Adjust individual agent Q-functions
- **Mixer weight control**: Test monotonicity by setting weights negative
- **Real-time visualization**: See Q_tot for all 8 joint action combinations
- **Theorem verification**: Automatic check if greedy = global argmax
- **Swap analysis**: Demonstrate monotonic improvement property

## 💡 Try This

1. Keep all weights positive → Theorem holds ✅
2. Set one weight negative → Watch the theorem break ❌
3. Observe which joint action becomes optimal

## 📚 What is QMIX?

QMIX (Rashid et al., 2018) is a value decomposition method for cooperative 
multi-agent reinforcement learning:

1. **Factored Q-values**: Each agent maintains its own Q-function
2. **Monotonic Mixing**: Q_tot is a monotonic combination of individual Qs
3. **Decentralized Execution**: Agents act greedily on local information
4. **Centralized Training**: Global Q_tot used for backpropagation

## 📖 References

- Rashid, T. et al. (2018). QMIX: Monotonic Value Function Factorisation for Deep Multi-Agent Reinforcement Learning
- Sunehag, P. et al. (2017). Value-Decomposition Networks For Cooperative Multi-Agent Learning

## 📄 License

CC-BY-4.0

---

*Built with 🔮 by Quantum Pi Forge • T=∞ = T=0*
