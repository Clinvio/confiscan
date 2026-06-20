# Confiscan

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://github.com/Clinvio/confiscan/actions/workflows/ci.yml/badge.svg)](https://github.com/Clinvio/confiscan/actions)

**Pre-commit secret and PII scanner for configuration files**

Confiscan scans your configuration files (.env, .yml, .yaml, .properties, .json) for hardcoded secrets and PII before they get committed to your repository.

## Features

- **Secrets Detection**: AWS keys, JWT tokens, API keys, database connection strings, private keys
- **PII Detection**: Email addresses, SSNs, phone numbers, dates of birth, addresses, healthcare info
- **Multiple Output Formats**: Text, JSON, SARIF
- **Pre-commit Integration**: Git hooks, husky, pre-commit framework
- **CI/CD Ready**: Exit codes for pipeline integration
- **Privacy First**: All scanning happens locally, no data leaves your machine
- **Standalone Binaries**: No Node.js required for end users

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

Scan a path for secrets and PII.

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
```

### `confiscan init`

Initialize configuration and pre-commit hooks.

**Creates:**
- `.confiscanrc.json` - Configuration file
- `.git/hooks/pre-commit` - Git pre-commit hook

### `confiscan license <key>`

Activate a Pro license for additional features.

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

### PII Rules

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
        run: confiscan scan --format sarif > results.sarif
      - uses: github/codeql-action/upload-sarif@v2
        with:
          sarif_file: results.sarif
```

### GitLab CI

```yaml
security_scan:
  stage: test
  script:
    - curl -sL https://github.com/Clinvio/confiscan/releases/download/v1.0.0/confiscan-linux-x64.tar.gz | tar xz
    - ./confiscan scan --format json > results.json
  artifacts:
    reports:
      sast: results.json
```

## Development

### Prerequisites

- Node.js 18+
- npm 9+

### Setup

```bash
# Clone repository
git clone https://github.com/Clinvio/confiscan.git
cd confiscan

# Install dependencies
npm install

# Build packages
npm run build

# Run tests
npm test
```

### Project Structure

```
confiscan/
├── packages/
│   ├── core/           # Shared detection engine
│   │   ├── src/
│   │   │   ├── types.ts
│   │   │   ├── utils/
│   │   │   └── rules/
│   │   │       ├── secrets/
│   │   │       └── pii/
│   │   └── rules/
│   │       └── __fixtures__/
│   ├── cli/            # CLI wrapper
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   └── commands/
│   │   └── README.md
│   └── github-action/  # GitHub Action wrapper
├── credentials/        # Credentials (not committed)
├── .github/
│   └── workflows/
├── .gitignore
├── package.json
└── publish.sh          # Release script (not committed)
```

### Adding New Rules

1. Create rule file in `packages/core/src/rules/secrets/` or `packages/core/src/rules/pii/`
2. Implement the `Rule` interface
3. Add test fixtures in `packages/core/rules/__fixtures__/`
4. Add unit tests in `packages/core/src/__tests__/`
5. Update rule index file

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test --watch
```

### Building

```bash
# Build all packages
npm run build

# Build standalone binaries
./publish.sh binaries
```

## Release Process

### Creating a Release

```bash
# Build + create GitHub release with all binaries
./publish.sh release
```

This will:
1. Build TypeScript packages
2. Create standalone binaries for all platforms (macOS, Linux, Windows)
3. Create a GitHub release with all assets attached

### Release Assets

Each release includes:
- `confiscan-darwin-arm64.tar.gz` - macOS Apple Silicon
- `confiscan-darwin-x64.tar.gz` - macOS Intel
- `confiscan-linux-x64.tar.gz` - Linux x64
- `confiscan-linux-arm64.tar.gz` - Linux ARM64
- `confiscan-win-x64.zip` - Windows x64
- `clinvio-hu-confiscan-core-1.0.0.tgz` - Core npm package
- `clinvio-hu-confiscan-1.0.0.tgz` - CLI npm package

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
- **Discussions**: [GitHub Discussions](https://github.com/Clinvio/confiscan/discussions)
