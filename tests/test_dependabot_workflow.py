from pathlib import Path

import yaml


def test_dependabot_gate_requires_existing_ci_checks():
    workflow_path = (
        Path(__file__).parents[1] / ".github" / "workflows" / "dependabot-auto-merge.yml"
    )
    workflow = yaml.safe_load(workflow_path.read_text())
    steps = workflow["jobs"]["dependabot-auto-merge"]["steps"]
    gate_step = next(
        step for step in steps if step["name"] == "Run Dependabot auto-merge gate"
    )

    required_checks = {
        check.strip()
        for check in gate_step["env"]["REQUIRED_CHECKS"].split(",")
    }

    assert required_checks == {
        "Lint and Test",
        "Build and Package",
        "API Health Check",
        "healthcheck",
    }
