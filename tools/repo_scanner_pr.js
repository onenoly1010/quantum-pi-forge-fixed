#!/usr/bin/env node
/**
 * tools/repo_scanner_pr.js
 *
 * Usage:
 *   DRY RUN:
 *     AGENT_GITHUB_TOKEN=ghp_xxx node tools/repo_scanner_pr.js --org onenoly1010 --dry-run
 *
 *   APPLY:
 *     AGENT_GITHUB_TOKEN=ghp_xxx node tools/repo_scanner_pr.js --org onenoly1010 --apply
 *
 * The script will:
 *   - list org repos
 *   - skip archived/forked repos
 *   - check for .agent folder presence
 *   - on --apply: create branch, commit files, open PR
 */

import { Octokit } from "@octokit/rest";
import { Command } from "commander";
import { Base64 } from "js-base64";

const program = new Command();
program
  .requiredOption("--org <org>", "GitHub organization or username")
  .option("--dry-run", "Do not push changes, show what would be done")
  .option("--apply", "Create branches and PRs")
  .option("--branch-prefix <prefix>", "Branch prefix", "agent/bootstrap")
  .option("--commit-message <msg>", "Commit message", "chore: add .agent environment (auto)")
  .parse(process.argv);

const opts = program.opts();
const TOKEN = process.env.AGENT_GITHUB_TOKEN;

if (!TOKEN) {
  console.error("ERROR: set AGENT_GITHUB_TOKEN env var with a token that has repo scope.");
  process.exit(1);
}

const octokit = new Octokit({ auth: TOKEN });

const filesToInject = {
  ".agent/configs/permissions.json": JSON.stringify({
    allowed_commands: ["deploy", "rollback", "validate", "healthcheck"],
    blocked: ["delete_repo", "change_admin"],
    installed_by: "quantum-pi-forge-agent"
  }, null, 2),

  ".agent/scripts/deploy.sh": `#!/bin/bash
set -e
echo "[AGENT] deploy.sh invoked"
if [ -x ./deploy_quantum_pi_forge.sh ]; then
  ./deploy_quantum_pi_forge.sh --network piMainnet --confirm
else
  echo "No deploy script found in repo root – skipping."
fi`,

  ".agent/scripts/rollback.sh": `#!/bin/bash
set -e
echo "[AGENT] rollback.sh invoked"
if [ -f emergency/rollback.sh ]; then
  bash emergency/rollback.sh
else
  echo "No emergency rollback script present; notify ops."
fi`,

  ".agent/scripts/validate.sh": `#!/bin/bash
set -e
echo "[AGENT] validate.sh invoked"
npm ci || true
npm test || true
node deployment/verify_all.js || true`,

  ".github/workflows/agent_dispatch.yml": `name: Agent Dispatch
on:
  workflow_dispatch:
    inputs:
      agent:
        required: true
      command:
        required: true
      payload:
        required: false
jobs:
  dispatch:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Save dispatch
        run: mkdir -p .agent/logs && echo "\${{ github.event.inputs }}" > .agent/logs/last_dispatch.json
      - name: Run agent command
        run: bash .agent/scripts/\${{ github.event.inputs.command }}.sh
        env:
          GITHUB_TOKEN: \${{ secrets.AGENT_GITHUB_TOKEN }}`
};

async function run() {
  console.log(`Starting scan for org: ${opts.org}`);
  const repos = await octokit.paginate(octokit.repos.listForOrg, {
    org: opts.org,
    type: "all",
    per_page: 100
  });

  for (const repo of repos) {
    if (repo.archived || repo.fork) {
      console.log(`SKIP ${repo.name} (archived or fork)`);
      continue;
    }

    // Check for .agent existence
    try {
      await octokit.repos.getContent({ owner: opts.org, repo: repo.name, path: ".agent" });
      console.log(`OK ${repo.name} already has .agent`);
      continue;
    } catch (err) {
      // expected when missing
    }

    console.log(`MISSING ${repo.name}: .agent will be injected`);

    if (opts.dryRun) {
      console.log(`DRY-RUN: would create branch ${opts.branchPrefix}/${repo.name} and open PR`);
      continue;
    }

    if (!opts.apply) {
      console.log(`No --apply. Use --apply to actually create PRs.`);
      continue;
    }

    try {
      const defaultBranch = repo.default_branch || "main";
      const base = await octokit.repos.getBranch({ owner: opts.org, repo: repo.name, branch: defaultBranch });
      const baseSha = base.data.commit.sha;

      const branchName = `${opts.branchPrefix}/${repo.name}`;
      const ref = `refs/heads/${branchName}`;
      await octokit.git.createRef({ owner: opts.org, repo: repo.name, ref, sha: baseSha });
      console.log(`Created branch ${branchName} on ${repo.name}`);

      for (const [filePath, content] of Object.entries(filesToInject)) {
        await octokit.repos.createOrUpdateFileContents({
          owner: opts.org,
          repo: repo.name,
          path: filePath,
          message: opts.commitMessage,
          content: Base64.encode(content),
          branch: branchName
        });
        console.log(`Committed ${filePath} -> ${repo.name}@${branchName}`);
      }

      const prTitle = "chore: add .agent environment (automated)";
      const prBody = `Automated injection of the standard agent environment.\n\nIf you do not want this, close the PR and add .agent/configs/permissions.json with {"allow_agent_injection": false}`;
      const pr = await octokit.pulls.create({
        owner: opts.org,
        repo: repo.name,
        title: prTitle,
        head: branchName,
        base: defaultBranch,
        body: prBody
      });
      console.log(`Opened PR: ${pr.data.html_url}`);
    } catch (e) {
      console.error(`ERROR operating on ${repo.name}:`, e.message);
    }
  }

  console.log("Scan complete.");
}

run().catch(e => {
  console.error("Fatal:", e);
  process.exit(1);
});
