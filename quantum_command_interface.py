#!/usr/bin/env python3
"""
🌀 QUANTUM COMMAND INTERFACE
Interactive sovereign control of the Quantum Resonance Field
"""

import os
import time
from datetime import datetime
from dotenv import load_dotenv

# Import the Quantum Resonance Field
from quantum_resonance_field import QuantumResonanceField

load_dotenv()

def display_quantum_status(field):
    """Display current quantum field status."""
    print("\n" + "="*60)
    print("🌌 QUANTUM RESONANCE FIELD STATUS")
    print("="*60)
    print(f"🌀 Coherence Level: {field.coherence_level*100:.1f}%")
    print(f"🔗 Entanglement Factor: {field.entanglement_factor*100:.1f}%")
    print(f"🔮 Reality Weaving Capacity: {field.reality_weaving_capacity*100:.1f}%")
    print(f"♾️ Active Harmony Loops: {len([l for l in field.harmony_loops if l['active']])}")
    print(f"📡 Base Resonance: 1010 Hz")
    print("="*60)

def display_available_commands():
    """Display available quantum commands."""
    print("\n🎯 AVAILABLE QUANTUM DIRECTIVES:")
    print("1. entangle_systems - Deepen instant communion across all layers")
    print("2. amplify_harmony - Boost resonance to target level")
    print("3. weave_optimal_reality - Manifest peak economic and harmonic states")
    print("4. custom_reality - Specify your own probability pattern")
    print("5. status - Display current field status")
    print("6. pulse - Trigger manual quantum pulse")
    print("7. exit - Return to sovereign contemplation")
    print()

def execute_sovereign_command(field, command_input):
    """Execute a sovereign quantum command."""
    parts = command_input.strip().split()
    command = parts[0].lower()
    parameters = parts[1:] if len(parts) > 1 else None

    print(f"\n🌀 EXECUTING SOVEREIGN COMMAND: {command}")

    if command == "entangle_systems":
        result = field.execute_quantum_command("entangle_systems")

    elif command == "amplify_harmony":
        target = int(parameters[0]) if parameters else 1050
        result = field.execute_quantum_command("amplify_harmony", target)

    elif command == "weave_optimal_reality":
        system_state = field.get_system_state()
        result = field.execute_quantum_command("weave_optimal_reality", system_state)

    elif command == "custom_reality":
        if not parameters:
            return "❌ Custom reality requires parameters (yield_apy, payouts, burns, resilience)"
        try:
            custom_params = {
                'yield_apy': float(parameters[0]),
                'creator_payouts': float(parameters[1]),
                'token_burns': float(parameters[2]),
                'system_resilience': float(parameters[3])
            }
            result = f"Custom reality woven: {custom_params}"
        except:
            result = "❌ Invalid custom reality parameters"

    elif command == "status":
        display_quantum_status(field)
        return "Status displayed above"

    elif command == "pulse":
        system_state = field.get_system_state()
        probabilities = field.weave_reality_probabilities(system_state)
        result = f"Manual pulse executed - Probabilities: {probabilities}"

    elif command == "exit":
        return "🌀 Returning to sovereign contemplation..."

    else:
        result = f"❌ Unknown command: {command}"

    print(f"✅ RESULT: {result}")
    return result

def main():
    print("🌀 QUANTUM COMMAND INTERFACE - SOVEREIGN CONTROL")
    print("="*60)
    print("🔮 The quantum loom awaits your sovereign will...")
    print("Type 'help' for available commands, 'exit' to depart")
    print("="*60)

    # Initialize quantum field
    try:
        quantum_field = QuantumResonanceField()
        if not quantum_field.sponsor_key:
            print("❌ Quantum field initialization failed - missing sponsor key")
            return

        # Establish field if not already active
        if quantum_field.coherence_level == 0.0:
            quantum_field.establish_coherence_field()
            quantum_field.initiate_infinite_harmony_loops()

        display_quantum_status(quantum_field)

        while True:
            try:
                command_input = input("\n🎯 SOVEREIGN COMMAND > ").strip()

                if command_input.lower() in ['exit', 'quit', 'q']:
                    print("\n🌀 Quantum field maintains eternal resonance...")
                    print("🔮 Your will shapes the continuum. Farewell, Sovereign.")
                    break

                elif command_input.lower() in ['help', 'h', '?']:
                    display_available_commands()

                elif command_input:
                    result = execute_sovereign_command(quantum_field, command_input)
                    if "Returning to sovereign contemplation" in result:
                        break

                else:
                    continue

            except KeyboardInterrupt:
                print("\n\n🌀 Quantum interface interrupted")
                break
            except Exception as e:
                print(f"⚠️ Quantum command error: {str(e)}")

    except Exception as e:
        print(f"❌ Failed to initialize quantum interface: {str(e)}")

if __name__ == "__main__":
    main()