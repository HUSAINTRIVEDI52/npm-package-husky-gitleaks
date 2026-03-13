#!/usr/bin/env node
const { installHusky } = require('../lib/husky');
const { installGitleaks } = require('../lib/gitleaks');
const { installSonarScanner, setupSonarProperties } = require('../lib/sonarqube');
const { setupPreCommitHook } = require('../lib/hooks');
// Added by Arjun — import CI setup functions from the new lib/ci.js module
const { setupPrePushHook, setupCIScript, setupCIWorkflow, validateProject, ensurePackageLock } = require('../lib/ci');
const { isGitRepo } = require('../lib/git');
const { logInfo, logError, logSuccess } = require('../lib/logger');

const command = process.argv[2];

// Detect how this script is being invoked:
// 1. Manual CLI:   npx secure-husky-setup init  → command === 'init'
// 2. Manual CLI:   npx secure-husky-setup       → no command; defaults to init
// 3. postinstall:  npm install                   → npm_lifecycle_event === 'postinstall', no command arg
const isPostInstall = process.env.npm_lifecycle_event === 'postinstall';
const shouldRun = !command || command === 'init' || isPostInstall;

if (isPostInstall) {
  // Try to find the user's project directory (where they ran npm install)
  const targetDir = process.env.INIT_CWD || process.env.npm_config_local_prefix;
  
  if (targetDir && targetDir !== process.cwd()) {
    logInfo(`Switching to project directory: ${targetDir}`);
    process.chdir(targetDir);
  }
}

(async () => {
  if (!shouldRun) {
    console.log("Usage: secure-husky-setup [init]");
    process.exit(0);
  }

  try {
    logInfo("Initializing secure git hooks...");

    if (!await isGitRepo()) {
      logError("Not inside a git repository. Skipping automatic secure-husky-setup.");
      logInfo("Please initialize a git repository first ('git init'), then manually run: npx secure-husky-setup init");
      process.exit(0);
    }

    // ── Existing steps — pre-commit hooks (no changes made here) ─────────────
    await installHusky();
    await installGitleaks();
    await installSonarScanner();
    await setupSonarProperties();
    await setupPreCommitHook();

    logSuccess("Secure Husky + Gitleaks + SonarQube setup completed.");
    logInfo("Next step: edit sonar-project.properties and set sonar.host.url and sonar.token.");

    // Added by Arjun — pre-push hook + GitHub Actions CI workflow setup ───────
    // Runs Newman API tests and smoke tests automatically on every git push
    logInfo("Setting up Newman & Smoke Test CI workflow...");

    // Added by Arjun — ensure package-lock.json exists (required by npm ci in workflow)
    await ensurePackageLock();

    // Added by Arjun — validate package.json has "start" and "test" scripts
    await validateProject();

    // Added by Arjun — write standalone scripts/run-ci-checks.sh (all test logic lives here)
    await setupCIScript();

    // Added by Arjun — copy ci-tests.yml into .github/workflows/
    await setupCIWorkflow();

    // Added by Arjun — create .husky/pre-push hook (thin wrapper that calls run-ci-checks.sh)
    await setupPrePushHook();

    logSuccess("Newman + Smoke Test pre-push hook and GitHub Actions workflow setup completed.");
    // ── End of Arjun's additions ──────────────────────────────────────────────

  } catch (err) {
    logError(err.message);
    process.exit(0);
  }
})();
