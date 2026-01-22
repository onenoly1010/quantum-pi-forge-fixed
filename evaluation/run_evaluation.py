"""
Quantum Pi Forge - AI Evaluation Framework

This module provides comprehensive evaluation of AI responses using
Azure AI Evaluation SDK with custom evaluators tailored for the
Sacred Trinity architecture and consciousness-aligned metrics.
"""

import os
import json
from typing import Any, Dict
from azure.ai.evaluation import (
    evaluate,
    CoherenceEvaluator,
    RelevanceEvaluator,
    OpenAIModelConfiguration,
)


# ==============================================================================
# Custom Evaluators
# ==============================================================================

class TaskCompletionEvaluator:
    """
    Evaluates whether the AI response successfully helps users achieve
    their intended goals based on the context and expected outcomes.
    """
    
    def __init__(self):
        pass
    
    def __call__(
        self, 
        *, 
        response: str, 
        expected_response: str,
        **kwargs
    ) -> Dict[str, Any]:
        """
        Evaluate task completion by comparing response to expected outcome.
        
        Args:
            response: The actual AI response
            expected_response: The expected response/outcome
            
        Returns:
            Dictionary with task_completion score (0-5) and reasoning
        """
        if not response or not expected_response:
            return {
                "task_completion": 0,
                "task_completion_reason": "Missing response or expected response"
            }
        
        response_lower = response.lower()
        expected_lower = expected_response.lower()
        
        # Extract key concepts from expected response
        expected_keywords = set(expected_lower.split())
        response_keywords = set(response_lower.split())
        
        # Calculate keyword overlap
        overlap = expected_keywords.intersection(response_keywords)
        coverage = len(overlap) / max(len(expected_keywords), 1)
        
        # Score based on coverage (0-5 scale)
        if coverage >= 0.7:
            score = 5
            reason = "Excellent coverage of expected outcomes"
        elif coverage >= 0.5:
            score = 4
            reason = "Good coverage with most key points addressed"
        elif coverage >= 0.3:
            score = 3
            reason = "Moderate coverage, some key points missing"
        elif coverage >= 0.1:
            score = 2
            reason = "Limited coverage of expected outcomes"
        else:
            score = 1
            reason = "Poor coverage, significant gaps"
        
        return {
            "task_completion": score,
            "task_completion_reason": reason,
            "task_completion_coverage": round(coverage, 3)
        }


class ResponseTimeEvaluator:
    """
    Evaluates response time performance for latency requirements.
    """
    
    def __init__(self, threshold_ms: int = 3000):
        self.threshold_ms = threshold_ms
    
    def __call__(
        self, 
        *, 
        response_time_ms: int,
        **kwargs
    ) -> Dict[str, Any]:
        """
        Evaluate response time against threshold.
        
        Args:
            response_time_ms: Response time in milliseconds
            
        Returns:
            Dictionary with response_time_score (0-5) and details
        """
        if response_time_ms <= self.threshold_ms * 0.3:
            score = 5
            status = "excellent"
        elif response_time_ms <= self.threshold_ms * 0.5:
            score = 4
            status = "good"
        elif response_time_ms <= self.threshold_ms * 0.7:
            score = 3
            status = "acceptable"
        elif response_time_ms <= self.threshold_ms:
            score = 2
            status = "slow"
        else:
            score = 1
            status = "unacceptable"
        
        return {
            "response_time_score": score,
            "response_time_status": status,
            "response_time_ms": response_time_ms,
            "response_time_threshold_ms": self.threshold_ms
        }


class QuantumPhaseAlignmentEvaluator:
    """
    Evaluates response alignment with quantum consciousness phases.
    This is specific to the Quantum Pi Forge architecture.
    """
    
    PHASE_KEYWORDS = {
        "foundation": ["authenticate", "security", "setup", "initialize", "establish", "configure", "connect"],
        "growth": ["expand", "process", "develop", "evolve", "scale", "integrate", "progress"],
        "harmony": ["balance", "synchronize", "coordinate", "align", "coherent", "unified", "stable"],
        "transcendence": ["complete", "enlighten", "transcend", "ultimate", "supreme", "manifest", "realize"]
    }
    
    def __init__(self):
        pass
    
    def __call__(
        self, 
        *, 
        response: str, 
        quantum_phase: str,
        **kwargs
    ) -> Dict[str, Any]:
        """
        Evaluate response alignment with the specified quantum phase.
        
        Args:
            response: The AI response text
            quantum_phase: The expected quantum phase (foundation/growth/harmony/transcendence)
            
        Returns:
            Dictionary with phase_alignment score and details
        """
        if not response or not quantum_phase:
            return {
                "phase_alignment": 0,
                "phase_alignment_reason": "Missing response or quantum phase"
            }
        
        response_lower = response.lower()
        phase = quantum_phase.lower()
        
        if phase not in self.PHASE_KEYWORDS:
            return {
                "phase_alignment": 3,
                "phase_alignment_reason": f"Unknown quantum phase: {phase}"
            }
        
        # Count phase-relevant keywords in response
        phase_keywords = self.PHASE_KEYWORDS[phase]
        matches = sum(1 for keyword in phase_keywords if keyword in response_lower)
        coverage = matches / len(phase_keywords)
        
        # Score based on phase alignment
        if coverage >= 0.5:
            score = 5
            reason = f"Excellent alignment with {phase} phase"
        elif coverage >= 0.3:
            score = 4
            reason = f"Good alignment with {phase} phase"
        elif coverage >= 0.15:
            score = 3
            reason = f"Moderate alignment with {phase} phase"
        else:
            score = 2
            reason = f"Limited alignment with {phase} phase"
        
        return {
            "phase_alignment": score,
            "phase_alignment_reason": reason,
            "phase_alignment_coverage": round(coverage, 3),
            "expected_phase": phase
        }


# ==============================================================================
# Evaluation Runner
# ==============================================================================

def run_evaluation(
    data_path: str = "evaluation_dataset.jsonl",
    output_path: str = "evaluation_results",
    model_config: dict = None
) -> Dict[str, Any]:
    """
    Run comprehensive evaluation on the dataset.
    
    Args:
        data_path: Path to the JSONL evaluation dataset
        output_path: Directory to save evaluation results
        model_config: Model configuration for prompt-based evaluators
        
    Returns:
        Dictionary containing evaluation results and metrics
    """
    
    print("🚀 Starting Quantum Pi Forge AI Evaluation...")
    print(f"📁 Dataset: {data_path}")
    print(f"📁 Output: {output_path}")
    print("")
    
    # Configure model for prompt-based evaluators
    if model_config is None:
        # Default to OpenAI configuration
        model_config = OpenAIModelConfiguration(
            type="openai",
            model=os.environ.get("OPENAI_MODEL", "gpt-4o-mini"),
            api_key=os.environ.get("OPENAI_API_KEY", ""),
        )
    
    # Initialize evaluators
    evaluators = {}
    evaluator_config = {}
    
    # Built-in evaluators (require model config)
    if os.environ.get("OPENAI_API_KEY"):
        print("✅ OpenAI API key found - enabling prompt-based evaluators")
        
        coherence_evaluator = CoherenceEvaluator(model_config=model_config)
        relevance_evaluator = RelevanceEvaluator(model_config=model_config)
        
        evaluators["coherence"] = coherence_evaluator
        evaluators["relevance"] = relevance_evaluator
        
        evaluator_config["coherence"] = {
            "column_mapping": {
                "query": "${data.query}",
                "response": "${data.response}"
            }
        }
        evaluator_config["relevance"] = {
            "column_mapping": {
                "query": "${data.query}",
                "response": "${data.response}"
            }
        }
    else:
        print("⚠️  No OpenAI API key - skipping prompt-based evaluators")
    
    # Custom code-based evaluators (no API key needed)
    task_completion_evaluator = TaskCompletionEvaluator()
    response_time_evaluator = ResponseTimeEvaluator(threshold_ms=3000)
    phase_alignment_evaluator = QuantumPhaseAlignmentEvaluator()
    
    evaluators["task_completion"] = task_completion_evaluator
    evaluators["response_time"] = response_time_evaluator
    evaluators["phase_alignment"] = phase_alignment_evaluator
    
    evaluator_config["task_completion"] = {
        "column_mapping": {
            "response": "${data.response}",
            "expected_response": "${data.expected_response}"
        }
    }
    evaluator_config["response_time"] = {
        "column_mapping": {
            "response_time_ms": "${data.response_time_ms}"
        }
    }
    evaluator_config["phase_alignment"] = {
        "column_mapping": {
            "response": "${data.response}",
            "quantum_phase": "${data.quantum_phase}"
        }
    }
    
    print(f"📊 Evaluators configured: {list(evaluators.keys())}")
    print("")
    
    # Run evaluation
    print("⏳ Running evaluation...")
    
    try:
        result = evaluate(
            data=data_path,
            evaluators=evaluators,
            evaluator_config=evaluator_config,
            output_path=output_path
        )
        
        print("")
        print("✅ Evaluation complete!")
        print("")
        
        # Display summary metrics
        if "metrics" in result:
            print("📊 Evaluation Metrics Summary:")
            print("-" * 50)
            for metric, value in result["metrics"].items():
                if isinstance(value, float):
                    print(f"  {metric}: {value:.3f}")
                else:
                    print(f"  {metric}: {value}")
            print("-" * 50)
        
        return result
        
    except Exception as e:
        print(f"❌ Evaluation failed: {e}")
        raise


def main():
    """Main entry point for evaluation."""
    import argparse
    
    parser = argparse.ArgumentParser(
        description="Run Quantum Pi Forge AI Evaluation"
    )
    parser.add_argument(
        "--data",
        type=str,
        default="evaluation_dataset.jsonl",
        help="Path to evaluation dataset (JSONL)"
    )
    parser.add_argument(
        "--output",
        type=str,
        default="evaluation_results",
        help="Output directory for results"
    )
    
    args = parser.parse_args()
    
    # Get the script directory
    script_dir = os.path.dirname(os.path.abspath(__file__))
    data_path = os.path.join(script_dir, args.data)
    output_path = os.path.join(script_dir, args.output)
    
    run_evaluation(data_path=data_path, output_path=output_path)


if __name__ == "__main__":
    main()
