# Phase 3: Distribution & Polish - Detailed Implementation Plan

## 3.1 Distribution Infrastructure

### 3.1.1 npm Publish Workflow

#### GitHub Actions Workflow
Create `.github/workflows/npm-publish.yml`:

```yaml
name: Publish to npm

on:
  push:
    tags:
      - 'v*'

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          registry-url: 'https://registry.npmjs.org'
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Run tests
        run: pnpm test
      
      - name: Run linting
        run: pnpm lint
      
      - name: Build packages
        run: pnpm build
      
      - name: Publish to npm
        run: pnpm publish --filter confiscan --no-git-checks
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

#### Package.json Updates
Update `packages/cli/package.json`:
- Add `prepublishOnly` script for building
- Add `version` script for semantic versioning
- Configure `files` field for npm package contents
- Add `repository`, `homepage`, `bugs` fields

#### Semantic Versioning
- Use `conventional-changelog` for version management
- Add `commitlint` for commit message validation
- Configure `husky` for git hooks

### 3.1.2 Homebrew Formula

#### Formula Structure
Create `Formula/confiscan.rb`:

```ruby
class Confiscan < Formula
  desc "Pre-commit secret and PII scanner for config files"
  homepage "https://github.com/Clinvio/confiscan"
  version "1.0.0"
  
  on_macos do
    on_arm do
      url "https://github.com/Clinvio/confiscan/releases/download/v#{version}/confiscan-darwin-arm64.tar.gz"
      sha256 "PLACEHOLDER"
    end
    on_intel do
      url "https://github.com/Clinvio/confiscan/releases/download/v#{version}/confiscan-darwin-x64.tar.gz"
      sha256 "PLACEHOLDER"
    end
  end
  
  on_linux do
    on_intel do
      url "https://github.com/Clinvio/confiscan/releases/download/v#{version}/confiscan-linux-x64.tar.gz"
      sha256 "PLACEHOLDER"
    end
  end
  
  def install
    bin.install "confiscan"
  end
  
  test do
    system "#{bin}/confiscan", "--version"
  end
end
```

#### Tap Repository
Create `Clinvio/homebrew-tap` repository for formula distribution.

### 3.1.3 Standalone Binary Compilation

#### Tool Selection
**Recommended**: `pkg` by Vercel
- Better compatibility with Node.js ecosystem
- Supports multiple platforms
- Active maintenance
- Good documentation

#### Build Configuration
Create `packages/cli/pkg.config.json`:

```json
{
  "name": "confiscan",
  "version": "1.0.0",
  "bin": "dist/index.js",
  "targets": ["node18-macos-arm64", "node18-macos-x64", "node18-linux-x64", "node18-win-x64"],
  "outputPath": "binaries"
}
```

#### Build Scripts
Add to `packages/cli/package.json`:

```json
{
  "scripts": {
    "build:binary": "pkg . --output binaries/confiscan",
    "build:binary:macos": "pkg . --target node18-macos-arm64,node18-macos-x64 --output binaries/confiscan",
    "build:binary:linux": "pkg . --target node18-linux-x64 --output binaries/confiscan",
    "build:binary:windows": "pkg . --target node18-win-x64 --output binaries/confiscan"
  }
}
```

### 3.1.4 README with Hook Snippets

#### README Structure
1. **Header**: Logo, badges, description
2. **Installation**: npm, Homebrew, binary, Docker
3. **Quick Start**: Basic usage, pre-commit hook setup
4. **Commands**: scan, init, license
5. **Configuration**: .confiscanrc.json, flags, environment variables
6. **Output Formats**: text, json, sarif
7. **Rules**: secrets, PII, custom
8. **Licensing**: free tier, pro tier
9. **Troubleshooting**: common issues
10. **Contributing**: development setup
11. **License**: MIT license

#### Pre-commit Hook Snippets

**Husky**:
```bash
# .husky/pre-commit
npx confiscan scan --staged
```

**pre-commit framework**:
```yaml
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/Clinvio/confiscan
    rev: v1.0.0
    hooks:
      - id: confiscan
        args: [--staged]
```

**Simple git hook**:
```bash
#!/bin/sh
# .git/hooks/pre-commit
npx confiscan scan --staged
```

## 3.2 False-Positive Regression Suite

### 3.2.1 Realistic Clean Config Files

#### Spring Boot Configurations
Create `packages/core/rules/__fixtures__/false-positive-regression/spring-boot/`:

1. **application.yml** - Complete Spring Boot configuration
   - Database configuration with env vars
   - Security configuration with env vars
   - Logging configuration
   - Custom application properties
   - Actuator configuration
   - Cache configuration

2. **application-dev.yml** - Development profile
   - H2 in-memory database
   - Debug logging
   - Development-specific properties

3. **application-prod.yml** - Production profile
   - Production database
   - Security hardening
   - Performance tuning

4. **bootstrap.yml** - Spring Cloud configuration
   - Config server configuration
   - Service discovery

#### Environment Example Files
Create `packages/core/rules/__fixtures__/false-positive-regression/env-examples/`:

1. **.env.example** - Node.js project
   - Database connection strings
   - API keys (placeholder values)
   - JWT secrets (placeholder values)
   - Email configuration

2. **.env.local.example** - Next.js project
   - Database URLs
   - Authentication secrets
   - Third-party API keys

3. **.env.development** - React project
   - Development API endpoints
   - Debug flags
   - Mock service URLs

4. **.env.production** - Production config
   - Production database
   - CDN URLs
   - Analytics keys

#### Docker Configurations
Create `packages/core/rules/__fixtures__/false-positive-regression/docker/`:

1. **docker-compose.yml** - Multi-service setup
   - Database service
   - Application service
   - Redis service
   - Environment variables

2. **Dockerfile** - Application build
   - Build arguments
   - Environment variables
   - Multi-stage build

#### Other Configurations
Create `packages/core/rules/__fixtures__/false-positive-regression/other/`:

1. **config.json** - JSON configuration
   - Application settings
   - Feature flags
   - API endpoints

2. **application.properties** - Java properties
   - Database configuration
   - Server settings
   - Logging configuration

### 3.2.2 Spring Boot Application Samples

#### application.yml Structure
```yaml
# Spring Boot Application Configuration
# This file should produce ZERO findings

spring:
  application:
    name: my-application
  
  # Database Configuration
  datasource:
    url: ${DATABASE_URL}
    username: ${DB_USERNAME}
    password: ${DB_PASSWORD}
    driver-class-name: org.postgresql.Driver
    hikari:
      maximum-pool-size: ${DB_POOL_SIZE:10}
      minimum-idle: ${DB_POOL_MIN_IDLE:5}
  
  # JPA Configuration
  jpa:
    hibernate:
      ddl-auto: ${JPA_DDL_AUTO:update}
    show-sql: ${JPA_SHOW_SQL:false}
    properties:
      hibernate:
        format_sql: true
  
  # Security Configuration
  security:
    user:
      name: ${SECURITY_USERNAME:user}
      password: ${SECURITY_PASSWORD:changeme}
    oauth2:
      client:
        registration:
          google:
            client-id: ${GOOGLE_CLIENT_ID}
            client-secret: ${GOOGLE_CLIENT_SECRET}

# Server Configuration
server:
  port: ${SERVER_PORT:8080}
  servlet:
    context-path: ${CONTEXT_PATH:/api}
  ssl:
    enabled: ${SSL_ENABLED:false}
    key-store: ${SSL_KEY_STORE}
    key-store-password: ${SSL_KEY_STORE_PASSWORD}

# JWT Configuration
jwt:
  secret: ${JWT_SECRET}
  expiration: ${JWT_EXPIRATION:86400}
  refresh-expiration: ${JWT_REFRESH_EXPIRATION:604800}

# Email Configuration
email:
  from: ${EMAIL_FROM:noreply@example.com}
  smtp:
    host: ${SMTP_HOST}
    port: ${SMTP_PORT:587}
    username: ${SMTP_USERNAME}
    password: ${SMTP_PASSWORD}

# Logging Configuration
logging:
  level:
    root: ${LOG_LEVEL:INFO}
    com.example: ${APP_LOG_LEVEL:DEBUG}
  pattern:
    console: "%d{yyyy-MM-dd HH:mm:ss} - %msg%n"
  file:
    name: ${LOG_FILE:logs/application.log}

# Actuator Configuration
management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics
  endpoint:
    health:
      show-details: ${HEALTH_DETAILS:when-authorized}

# Custom Application Properties
app:
  name: ${APP_NAME:My Application}
  version: ${APP_VERSION:1.0.0}
  features:
    cache-enabled: ${CACHE_ENABLED:true}
    notifications-enabled: ${NOTIFICATIONS_ENABLED:true}
```

### 3.2.3 .env.example Samples

#### Node.js Project (.env.example)
```bash
# Application
NODE_ENV=development
PORT=3000
APP_NAME=My Node.js App
APP_VERSION=1.0.0

# Database
DATABASE_URL=postgresql://username:password@localhost:5432/database_name
DB_HOST=localhost
DB_PORT=5432
DB_NAME=database_name
DB_USER=username
DB_PASSWORD=password

# Authentication
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRATION=86400
SESSION_SECRET=your_session_secret_here

# External Services
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your_s3_bucket

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_email_password

# Redis
REDIS_URL=redis://localhost:6379

# Logging
LOG_LEVEL=debug
LOG_FILE=logs/app.log

# Features
ENABLE_CACHE=true
ENABLE_RATE_LIMITING=true
```

#### React/Next.js Project (.env.local.example)
```bash
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/database_name

# Authentication
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000

# OAuth Providers
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_ID=your_github_id
GITHUB_SECRET=your_github_secret

# External Services
STRIPE_SECRET_KEY=sk_test_your_stripe_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key

# Email
EMAIL_SERVER=smtp://username:password@smtp.gmail.com:587
EMAIL_FROM=noreply@example.com

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### 3.2.4 Regression Suite Verification

#### Test Implementation
Create `packages/core/src/__tests__/regression-suite.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { allRules } from '../rules';
import { extractKeyValuePairs } from '../utils/regex';

describe('False-Positive Regression Suite', () => {
  const regressionPath = path.join(__dirname, '../../rules/__fixtures__/false-positive-regression');
  
  const configFiles = [
    'spring-boot/application.yml',
    'spring-boot/application-dev.yml',
    'spring-boot/application-prod.yml',
    'spring-boot/bootstrap.yml',
    'env-examples/.env.example',
    'env-examples/.env.local.example',
    'env-examples/.env.development',
    'env-examples/.env.production',
    'docker/docker-compose.yml',
    'docker/Dockerfile',
    'other/config.json',
    'other/application.properties'
  ];
  
  configFiles.forEach configFile => {
    it(`should produce zero findings for ${configFile}`, () => {
      const filePath = path.join(regressionPath, configFile);
      const content = fs.readFileSync(filePath, 'utf-8');
      const parsedKV = extractKeyValuePairs(content);
      const findings: any[] = [];
      
      for (const rule of allRules) {
        const ruleFindings = rule.detect(content, configFile, parsedKV);
        findings.push(...ruleFindings);
      }
      
      expect(findings.length).toBe(0);
    });
  });
});
```

#### CI Integration
Add to GitHub Actions workflow:

```yaml
- name: Run regression suite
  run: pnpm test -- --run regression-suite
```

## 3.3 Documentation

### 3.3.1 Comprehensive README

#### Header Section
```markdown
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
```

#### Installation Section
```markdown
## Installation

### npm (Recommended)
```bash
npm install -g confiscan
# or
npx confiscan scan
```

### Homebrew
```bash
brew install Clinvio/tap/confiscan
```

### Standalone Binary
Download from [GitHub Releases](https://github.com/Clinvio/confiscan/releases)

### Docker
```bash
docker run --rm -v $(pwd):/workspace confiscan/confiscan scan /workspace
```
```

#### Quick Start Section
```markdown
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
```

### 3.3.2 Usage Examples

#### Command Examples
```markdown
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

# Scan only secrets (no PII)
confiscan scan --no-pii
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
```

#### CI/CD Integration Examples
```markdown
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
```

### 3.3.3 Configuration Documentation

#### Configuration File
```markdown
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
```

### 3.3.4 Troubleshooting Guide

#### Common Issues
```markdown
## Troubleshooting

### No findings detected
1. Check if files are in supported formats (.env, .yml, .yaml, .properties, .json)
2. Verify files are not in ignored directories (node_modules, .git, etc.)
3. Check if `--no-pii` flag is disabling expected rules
4. Verify configuration file is not overriding rules

### False positives
1. Check if values are environment variable references (${VAR})
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
```

## Implementation Timeline

### Week 1: Distribution Infrastructure
- Day 1-2: npm publish workflow and package.json updates
- Day 3-4: Standalone binary compilation setup
- Day 5: Testing and validation

### Week 2: Homebrew & Documentation
- Day 1-2: Homebrew formula and tap repository
- Day 3-4: README creation and hook snippets
- Day 5: Documentation review

### Week 3: Regression Suite & Polish
- Day 1-2: Spring Boot configuration samples
- Day 3-4: Environment example files
- Day 5: Regression suite verification

### Week 4: Testing & Release
- Day 1-2: Multi-platform testing
- Day 3-4: Documentation finalization
- Day 5: Release preparation

## Success Metrics

### Distribution
- [ ] npm package published and installable
- [ ] Homebrew formula working on macOS and Linux
- [ ] Standalone binaries for all target platforms
- [ ] Installation documentation complete

### Regression Suite
- [ ] Zero findings on all clean config files
- [ ] CI pipeline integration complete
- [ ] Test coverage for regression suite
- [ ] Performance benchmarks established

### Documentation
- [ ] README comprehensive and well-organized
- [ ] All commands and options documented
- [ ] Usage examples practical and clear
- [ ] Troubleshooting guide helpful