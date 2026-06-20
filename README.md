# Confiscan Monorepo

[![npm version](https://badge.fury.io/js/confiscan.svg)](https://www.npmjs.com/package/confiscan)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://github.com/Clinvio/confiscan/actions/workflows/ci.yml/badge.svg)](https://github.com/Clinvio/confiscan/actions)

**Pre-commit secret and PII scanner for configuration files**

This monorepo contains the Confiscan CLI tool and GitHub Action for scanning configuration files for hardcoded secrets and PII.

## Packages

### [@confiscan/core](./packages/core)

Shared detection engine with pure functions and no I/O side effects.

- Secrets detection rules (AWS keys, JWT tokens, API keys, etc.)
- PII detection rules (email, SSN, phone, etc.)
- Utility functions (entropy calculation, regex matching, redaction)
- Configuration parsing

### [confiscan](./packages/cli)

CLI wrapper for the detection engine.

- `confiscan scan` - Scan files for secrets and PII
- `confiscan init` - Initialize configuration and pre-commit hooks
- `confiscan license` - Activate Pro license
- Multiple output formats (text, JSON, SARIF)
- Pre-commit hook integration

### [cve-comment-scanner](./packages/github-action)

GitHub Action for dependency CVE scanning with PR comments.

- Maven/Gradle dependency tree parsing
- OSV database integration
- PR comment formatting and updating
- Severity-based filtering

## Quick Start

### Install CLI

```bash
npm install -g confiscan
```

### Scan Current Directory

```bash
confiscan scan
```

### Scan Staged Files

```bash
confiscan scan --staged
```

### Initialize Pre-commit Hook

```bash
confiscan init
```

## Development

### Prerequisites

- Node.js 18+
- pnpm 8+

### Setup

```bash
# Clone repository
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
└── pnpm-workspace.yaml
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
pnpm test

# Run tests for specific package
pnpm --filter @confiscan/core test
pnpm --filter confiscan test

# Run tests in watch mode
pnpm --filter @confiscan/core test --watch
```

### Building

```bash
# Build all packages
pnpm build

# Build specific package
pnpm --filter @confiscan/core build
pnpm --filter confiscan build
```

## Release Process

### Versioning

We use [Changesets](https://github.com/changesets/changesets) for version management.

```bash
# Create a changeset
pnpm changeset

# Version packages
pnpm version

# Publish to npm
pnpm release
```

### Publishing

1. Create a changeset with your changes
2. Merge to main branch
3. GitHub Actions will automatically:
   - Run tests
   - Build packages
   - Publish to npm
   - Create GitHub release with binaries

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Run linting and tests
6. Submit a pull request

## License

MIT © [Clinvio](https://github.com/Clinvio)

## Support

- **Issues**: [GitHub Issues](https://github.com/Clinvio/confiscan/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Clinvio/confiscan/discussions)
- **Email**: support@clinvio.com