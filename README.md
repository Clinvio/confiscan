# Confiscan

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://github.com/Clinvio/confiscan/actions/workflows/ci.yml/badge.svg)](https://github.com/Clinvio/confiscan/actions)

**Pre-commit secret scanner for configuration files**

Confiscan scans your configuration files (.env, .yml, .yaml, .properties, .json) for hardcoded secrets before they get committed to your repository.

## Features

- **Secrets Detection**: AWS keys, JWT tokens, API keys, database connection strings, private keys
- **Multiple Output Formats**: Text (JSON and SARIF available in Pro)
- **Pre-commit Integration**: Git hooks, husky, pre-commit framework
- **CI/CD Ready**: Exit codes for pipeline integration
- **Privacy First**: All scanning happens locally, no data leaves your machine
- **Standalone Binaries**: No Node.js required

## Installation

### Standalone Binary (Recommended)

Download the binary for your platform from [GitHub Releases](https://github.com/Clinvio/confiscan/releases):

| Platform | Architecture | File |
|----------|--------------|------|
| macOS | Apple Silicon (ARM64) | `confiscan-darwin-arm64.tar.gz` |
| macOS | Intel (x64) | `confiscan-darwin-x64.tar.gz` |
| Linux | x64 | `confiscan-linux-x64.tar.gz` |
| Linux | ARM64 | `confiscan-linux-arm64.tar.gz` |
| Windows | x64 | `confiscan-win-x64.zip` |

```bash
# Extract and install (macOS/Linux)
tar -xzf confiscan-*.tar.gz
chmod +x confiscan
sudo mv confiscan /usr/local/bin/

# Verify installation
confiscan --version
```

### From GitHub

```bash
npm install -g git+https://github.com/Clinvio/confiscan.git
```

### Clone and Link

```bash
git clone https://github.com/Clinvio/confiscan.git
cd confiscan
npm install && npm run build
npm link packages/cli
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

### Initialize Pre-commit Hook

```bash
confiscan init
```

## Commands

### `confiscan scan [path]`

Scan a path for secrets.

**Flags:**
- `--format <text>` - Output format (default: text)
- `--fail-on <low|medium|high|critical>` - Fail on severity threshold (default: medium)
- `--staged` - Scan only git-staged files
- `--config <path>` - Override config file location
- `--ignore <glob>` - Additional ignore globs (repeatable)
- `--no-pii` - Disable PII detection rules

**Examples:**

```bash
# Scan with custom fail threshold
confiscan scan --fail-on high

# Scan with ignore patterns
confiscan scan --ignore "*.test.*" --ignore "test/**"
```

### `confiscan init`

Initialize configuration and pre-commit hooks.

**Creates:**
- `.confiscanrc.json` - Configuration file
- `.git/hooks/pre-commit` - Git pre-commit hook

## Configuration

### .confiscanrc.json

```json
{
  "version": "1.0.0",
  "failOn": "medium",
  "ignore": [
    "test/**",
    "*.test.*",
    "node_modules/**"
  ],
  "noPii": false,
  "rules": {}
}
```

### Environment Variables

- `CONFISCAN_FAIL_ON` - Default fail-on threshold
- `CONFISCAN_FORMAT` - Default output format
- `CONFISCAN_IGNORE` - Additional ignore patterns (comma-separated)
- `CONFISCAN_NO_PII` - Disable PII detection

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

## Pre-commit Hook Setup

### Husky

```bash
npm install -D husky
npx husky install
npx husky add .husky/pre-commit "npx confiscan scan --staged"
```

### pre-commit Framework

```yaml
# .pre-commit-config.yaml
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
confiscan scan --staged
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
      - name: Install Confiscan
        run: |
          curl -sL https://github.com/Clinvio/confiscan/releases/download/v1.0.0/confiscan-linux-x64.tar.gz | tar xz
          sudo mv confiscan /usr/local/bin/
      - name: Run scan
        run: confiscan scan
```

### GitLab CI

```yaml
security_scan:
  stage: test
  script:
    - curl -sL https://github.com/Clinvio/confiscan/releases/download/v1.0.0/confiscan-linux-x64.tar.gz | tar xz
    - ./confiscan scan
```

## Output Format

### Text Output (Default)

```
[CRITICAL] secrets.aws-access-key  config/application.yml:14
  AWS access key detected. Move to environment variables or AWS IAM roles.
  Matched: AKIA****ZK

[HIGH] secrets.jwt-hardcoded  .env:8
  Hardcoded JWT token detected. Move to environment variables or secrets manager.
  Matched: eyJh****9w
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Run tests: `npm test`
6. Submit a pull request

## License

MIT © [Clinvio](https://github.com/Clinvio)

## Support

- **Issues**: [GitHub Issues](https://github.com/Clinvio/confiscan/issues)
