# Secure Husky Setup

Automatically installs and configures:

- Husky (Git hooks)
- Gitleaks (secret scanning)
- Pre-commit protection

## Install from GitHub

Inside your project directory:

```bash
npm install --save-dev git+https://github.com/HUSAINTRIVEDI52/npm-package-husky-gitleaks.git
```

## Initialize

No extra init command is required for the normal flow.

When the package is installed, it auto-runs setup through `postinstall`.

If you need to run it manually (for example, after `git init`), you can use either command:

```bash
npx secure-husky-setup
# or
npx secure-husky-setup init
```

This will:

- Install Husky locally
- Download Gitleaks locally
- Configure the pre-commit hook

## Done

Now every `git commit` will automatically scan for secrets.

If secrets are detected, the commit will be blocked.
