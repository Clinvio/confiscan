# Confiscan

[![npm version](https://badge.fury.io/js/confiscan.svg)](https://www.npmjs.com/package/confiscan)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://github.com/Clinvio/confiscan/actions/workflows/ci.yml/badge.svg)](https://github.com/Clinvio/confiscan/actions)

**Pre-commit secret and PII scanner for configuration files**

Confiscan scans your configuration files (.env, .yml, .yaml, .properties, .json) for hardcoded secrets and PII before they get committed to your repository.

## Features

- **Secrets Detection**: AWS keys, JWT tokens, API keys, database connection strings, private keys
- **PII Detection**: Email addresses, SSNs, phone numbers, dates of birth, addresses, healthcare info
- **Multiple Output Formats**: Text, JSON, SARIF (Pro)
- **Pre-commit Integration**: Git hooks, husky, pre-commit framework
- **CI/CD Ready**: Exit codes for pipeline integration
- **Privacy First**: All scanning happens locally, no data leaves your machine

## Installation

### From GitHub (Recommended)

```bash
# Install directly from GitHub
npm install -g git+https://github.com/Clinvio/confiscan.git

# Or install a specific version
npm install -g git+https://github.com/Clinvio/confiscan.git#v1.0.0
```

### Clone and Link

```bash
# Clone the repository
git clone https://github.com/Clinvio/confiscan.git
cd confiscan

# Install dependencies and build
npm install
npm run build

# Link globally
npm link packages/cli
```

### Download Release

Download the latest release tarballs from [GitHub Releases](https://github.com/Clinvio/confiscan/releases):

- `clinvio-hu-confiscan-core-1.0.0.tgz` - Core detection engine
- `clinvio-hu-confiscan-1.0.0.tgz` - CLI tool

```bash
# Install from downloaded tarball
npm install -g clinvio-hu-confiscan-1.0.0.tgz
```

## Quick Start

### Scan Current Directory

```bash
confiscan scan
```

### Scan Specific Path

```bash
confiscan scan ./config
```

### Scan Staged Files (Pre-commit)

```bash
confiscan scan --staged
```

### Initialize Configuration

```bash
confiscan init
```

### Activate Pro License

```bash
confiscan license YOUR_LICENSE_KEY
```

## Commands

### `confiscan scan [path]`

Scan a path for secrets and PII.

**Arguments:**
- `[path]` - Path to scan (default: current directory)

**Flags:**
- `--format <text|json|sarif>` - Output format (default: text)
- `--fail-on <low|medium|high|critical>` - Fail on severity threshold (default: medium)
- `--staged` - Scan only git-staged files
- `--config <path>` - Override config file location
- `--ignore <glob>` - Additional ignore globs (repeatable)
- `--no-pii` - Disable PII detection rules

**Examples:**

```bash
# Scan with JSON output
confiscan scan --format json

# Scan with SARIF output for GitHub code scanning
confiscan scan --format sarif

# Scan with custom fail threshold
confiscan scan --fail-on high

# Scan with ignore patterns
confiscan scan --ignore "*.test.*" --ignore "test/**"

# Scan only secrets (no PII)
confiscan scan --no-pii

# Scan specific file types
confiscan scan --ignore "*.md" --ignore "*.txt"
```

### `confiscan init`

Initialize configuration and pre-commit hooks.

**Creates:**
- `.confiscanrc.json` - Configuration file
- `.git/hooks/pre-commit` - Git pre-commit hook

### `confiscan license <key>`

Activate a Pro license.

**Pro Features:**
- PII detection rules
- JSON output format
- SARIF output format
- Custom rule definitions

## Configuration

### .confiscanrc.json

Create a `.confiscanrc.json` file in your project root:

```json
{
  "version": "1.0.0",
  "failOn": "medium",
  "ignore": [
    "test/**",
    "*.test.*",
    "node_modules/**",
    "dist/**"
  ],
  "noPii": false,
  "rules": {
    "secrets.aws-access-key": {
      "severity": "critical"
    },
    "pii.email-field": {
      "severity": "medium"
    }
  }
}
```

### Environment Variables

- `CONFISCAN_FAIL_ON` - Default fail-on threshold
- `CONFISCAN_FORMAT` - Default output format
- `CONFISCAN_IGNORE` - Additional ignore patterns (comma-separated)
- `CONFISCAN_NO_PII` - Disable PII detection
- `CONFISCAN_CONFIG` - Config file path

### Default Values

| Option | Default | Description |
|--------|---------|-------------|
| `failOn` | `medium` | Minimum severity to fail |
| `format` | `text` | Output format |
| `noPii` | `false` | Disable PII detection |
| `ignore` | `[]` | Additional ignore patterns |

## Output Formats

### Text Output (Default)

Human-readable output with severity icons:

```
🔴 [CRITICAL] secrets.aws-access-key  config/application.yml:14
  AWS access key detected. Move to environment variables or AWS IAM roles.
  Matched: AKIA****XY

🟠 [HIGH] secrets.jwt-hardcoded  .env:8
  Hardcoded JWT token detected. Move to environment variables or secrets manager.
  Matched: eyJh****9w
```

### JSON Output (Pro)

Machine-readable output for CI piping:

```json
{
  "version": "1.0.0",
  "timestamp": "2026-06-20T12:00:00.000Z",
  "summary": {
    "findingsCount": 2,
    "filesScanned": 5,
    "durationMs": 150,
    "severityCounts": {
      "critical": 1,
      "high": 1,
      "medium": 0,
      "low": 0
    }
  },
  "findings": [
    {
      "ruleId": "secrets.aws-access-key",
      "severity": "critical",
      "file": "config/application.yml",
      "line": 14,
      "message": "AWS access key detected. Move to environment variables or AWS IAM roles.",
      "matchedText": "AKIA****XY"
    }
  ]
}
```

### SARIF Output (Pro)

GitHub code-scanning compatible output:

```json
{
  "$schema": "https://raw.githubusercontent.com/oasis-tcs/sarif-spec/master/Schemata/sarif-schema-2.1.0.json",
  "version": "2.1.0",
  "runs": [
    {
      "tool": {
        "driver": {
          "name": "confiscan",
          "version": "1.0.0",
          "rules": [...]
        }
      },
      "results": [...]
    }
  ]
}
```

## Rules

### Secrets Rules

| Rule ID | Severity | Description |
|---------|----------|-------------|
| `secrets.aws-access-key` | Critical | AWS access key detected |
| `secrets.aws-secret-key` | Critical | AWS secret key detected |
| `secrets.private-key-block` | Critical | Private key block detected |
| `secrets.db-connection-string` | Critical | Database connection string with password |
| `secrets.jwt-hardcoded` | High | Hardcoded JWT token detected |
| `secrets.slack-webhook` | High | Slack webhook URL detected |
| `secrets.generic-api-key` | High | API key detected |
| `secrets.generic-high-entropy` | Medium | High-entropy string near sensitive key |

### PII Rules (Pro)

| Rule ID | Severity | Description |
|---------|----------|-------------|
| `pii.email-field` | Medium | Hardcoded email address detected |
| `pii.ssn-field` | High | Hardcoded SSN/national ID detected |
| `pii.phone-field` | Medium | Hardcoded phone number detected |
| `pii.dob-field` | Medium | Hardcoded date of birth detected |
| `pii.address-field` | Medium | Hardcoded address detected |
| `pii.health-field` | High | Hardcoded healthcare information detected |

## Pre-commit Hook Setup

### Husky

```bash
# Install husky
npm install -D husky

# Initialize husky
npx husky install

# Add pre-commit hook
npx husky add .husky/pre-commit "npx confiscan scan --staged"
```

### pre-commit Framework

Create `.pre-commit-config.yaml`:

```yaml
repos:
  - repo: https://github.com/Clinvio/confiscan
    rev: v1.0.0
    hooks:
      - id: confiscan
        args: [--staged]
```

### Simple Git Hook

```bash
#!/bin/sh
# .git/hooks/pre-commit
npx confiscan scan --staged
```

## CI/CD Integration

### GitHub Actions

```yaml
name: Security Scan
on: [push, pull_request]

jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      - run: npm install -g confiscan
      - run: confiscan scan --format sarif > results.sarif
      - uses: github/codeql-action/upload-sarif@v2
        with:
          sarif_file: results.sarif
```

### GitLab CI

```yaml
security_scan:
  stage: test
  image: node:18
  script:
    - npm install -g confiscan
    - confiscan scan --format json > results.json
  artifacts:
    reports:
      sast: results.json
```

### Jenkins

```groovy
stage('Security Scan') {
    steps {
        sh 'npm install -g confiscan'
        sh 'confiscan scan --format json > results.json'
    }
    post {
        always {
            archiveArtifacts artifacts: 'results.json'
        }
    }
}
```

## Licensing

### Free Tier

- All secrets rules
- Text output format
- Unlimited use
- No license key required

### Pro Tier

- All PII rules
- JSON output format
- SARIF output format
- Custom rule definitions
- Priority support

### Activate Pro License

```bash
confiscan license YOUR_LICENSE_KEY
```

License is stored at `~/.confiscan/license` and validated offline.

## Troubleshooting

### No findings detected

1. Check if files are in supported formats (.env, .yml, .yaml, .properties, .json)
2. Verify files are not in ignored directories (node_modules, .git, etc.)
3. Check if `--no-pii` flag is disabling expected rules
4. Verify configuration file is not overriding rules

### False positives

1. Check if values are environment variable references (`${VAR}`)
2. Check if values are placeholders (changeme, example, etc.)
3. Add specific files to ignore patterns
4. Adjust rule severity in configuration

### License activation issues

1. Verify license key is correct
2. Check internet connection for license validation
3. Check `~/.confiscan/license` file permissions
4. Contact support if license is expired

### Performance issues

1. Use `--ignore` to exclude large directories
2. Scan specific subdirectories instead of entire project
3. Use `--staged` for pre-commit hooks
4. Consider using standalone binary for faster startup

### Integration problems

1. Verify exit codes are handled correctly in CI
2. Check output format compatibility with CI tools
3. Ensure SARIF format is valid for GitHub code scanning
4. Verify JSON output is parsed correctly

### Debug mode

Run with debug logging:

```bash
DEBUG=confiscan:* confiscan scan
```

## Contributing

### Development Setup

```bash
# Clone the repository
git clone https://github.com/Clinvio/confiscan.git
cd confiscan

# Install dependencies
pnpm install

# Build packages
pnpm build

# Run tests
pnpm test

# Run linting
pnpm lint
```

### Project Structure

```
confiscan/
├── packages/
│   ├── core/           # Shared detection engine
│   ├── cli/            # CLI wrapper
│   └── github-action/  # GitHub Action wrapper
├── credentials/        # Credentials (not committed)
├── .gitignore
├── package.json
└── pnpm-workspace.yaml
```

### Adding New Rules

1. Create rule file in `packages/core/src/rules/secrets/` or `packages/core/src/rules/pii/`
2. Implement rule interface
3. Add test fixtures in `packages/core/rules/__fixtures__/`
4. Add unit tests
5. Update documentation

## License

MIT © [Clinvio](https://github.com/Clinvio)

## Support

- **Issues**: [GitHub Issues](https://github.com/Clinvio/confiscan/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Clinvio/confiscan/discussions)
- **Email**: support@clinvio.com