# Confiscan Implementation Plan

## Architecture Overview

### Monorepo Structure
```
/
├── packages/
│   ├── core/           # Shared detection engine (pure functions, no I/O)
│   │   ├── rules/      # Rule definitions
│   │   │   ├── secrets/  # Secret detection rules
│   │   │   ├── pii/      # PII detection rules
│   │   │   └── __fixtures__/  # Test fixtures
│   │   └── utils/      # Shared utilities
│   ├── cli/            # Product B wrapper (confiscan CLI)
│   └── github-action/  # Product A wrapper (GitHub Action)
├── credentials/        # GitHub/npm/Stripe credentials (NEVER COMMIT)
├── .gitignore          # Must include credentials/
├── pnpm-workspace.yaml
├── package.json
└── tsconfig.json
```

### Core Design Principles
1. **Pure Functions**: Core detection engine has no I/O side effects
2. **Separation of Concerns**: Core logic separated from CLI/Action wrappers
3. **Testability**: Every rule has positive/negative fixtures
4. **Privacy First**: No telemetry, redacted output, license-only network calls
5. **Extensibility**: Rules as JSON/TS objects, easy to add new rules

## GitHub Organization & Repository Strategy

### Organization Details
- **GitHub User**: jokerz5575 (owner)
- **GitHub Organization**: Clinvio
- **Repositories**:
  - `confiscan` (public) - Free CLI tool
  - `confiscan-pro` (private) - Pro features and license server
  - `cve-comment-scanner` (public) - Free GitHub Action for public repos
  - `cve-comment-scanner-pro` (private) - Pro GitHub Action for private repos

### Credentials Management
- **Location**: `credentials/` folder in project root
- **Contents**: GitHub tokens, npm tokens, Stripe keys, license server credentials
- **Security**: NEVER commit credentials folder to git
- **Gitignore**: Must include `credentials/` in `.gitignore`

### Repository Visibility Rules
1. **Public Repositories**:
   - Core detection engine
   - CLI free tier features
   - GitHub Action for public repos
   - Documentation and examples

2. **Private Repositories**:
   - Pro features (PII rules, json/sarif output)
   - License server implementation
   - Stripe integration
   - GitHub Action for private repos

### Gitignore Configuration
```gitignore
# Credentials
credentials/

# Dependencies
node_modules/

# Build output
dist/
build/

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db

# Logs
*.log

# Environment
.env
.env.local
```

### Credentials Folder Structure
```
credentials/
├── github/
│   ├── token.txt          # GitHub personal access token
│   └── org-token.txt      # GitHub organization token
├── npm/
│   └── token.txt          # npm publish token
├── stripe/
│   ├── secret-key.txt     # Stripe secret key
│   └── webhook-secret.txt # Stripe webhook secret
└── license/
    └── jwt-secret.txt     # JWT signing secret for license server
```

**Usage**: Credentials are read from files at runtime, never hardcoded in source.

## Implementation Phases

### Phase 1: Foundation (M1 Milestone)
**Goal**: CLI v0.1 with secrets rules, text output, free tier

#### 1.1 Monorepo Setup
- Initialize pnpm workspace configuration
- Create package.json for each package
- Configure TypeScript with project references
- Setup vitest for testing
- Create .gitignore with credentials/ exclusion
- Create credentials folder structure (not committed)

#### 1.2 Core Detection Engine
- Define rule schema and types
- Implement KeyValuePair parser for config files
- Create base detection utilities (regex matching, entropy calculation)

#### 1.3 Secrets Rules Implementation
Priority order (based on complexity):
1. `secrets.private-key-block` - Simple regex pattern
2. `secrets.aws-access-key` - Pattern: AKIA[0-9A-Z]{16}
3. `secrets.jwt-hardcoded` - Pattern: eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+
4. `secrets.slack-webhook` - Pattern: hooks.slack.com/services/T[A-Z0-9]+/B[A-Z0-9]+/...
5. `secrets.db-connection-string` - Pattern with password extraction
6. `secrets.generic-api-key` - Key name matching + placeholder filtering
7. `secrets.aws-secret-key` - High entropy near specific key names
8. `secrets.generic-high-entropy` - Fallback: entropy >= 4.0 near sensitive key names

#### 1.4 CLI Wrapper
- Implement `confiscan scan [path]` command
- Implement `--staged` flag for git integration
- Implement `--format text` output
- Implement `--fail-on` severity threshold
- Implement `.gitignore` integration

#### 1.5 Test Infrastructure
- Create fixture directories for each rule
- Implement unit tests for all secrets rules
- Create integration test for scan command
- Setup false-positive regression suite

### Phase 2: Pro Features (M2 Milestone)
**Goal**: PII rules, license system, json/sarif output

#### 2.1 PII Rules Implementation
1. `pii.email-field` - Key name + email pattern validation
2. `pii.phone-field` - Key name + phone pattern validation
3. `pii.ssn-field` - Key name + SSN pattern validation
4. `pii.dob-field` - Key name + date pattern validation
5. `pii.address-field` - Key name + address pattern validation
6. `pii.health-field` - Key name + healthcare context

**Critical**: All PII rules must filter placeholder/env-var references

#### 2.2 License System
- Implement license key storage (~/.confiscan/license)
- Implement JWT validation and expiry checking
- Implement offline-first approach (check local JWT first)
- Implement graceful degradation to free tier
- Define license endpoint as configurable constant

#### 2.3 Output Formats
- Implement JSON output format
- Implement SARIF output format (Pro feature)
- Ensure redaction applies to all formats

#### 2.4 Configuration System
- Implement .confiscanrc.json loading
- Implement `--config` flag
- Implement `--ignore` glob patterns
- Implement `--no-pii` flag

### Phase 3: Distribution & Polish (M3 Milestone)
**Goal**: npm/Homebrew distribution, documentation, regression suite

#### 3.1 Distribution
- Configure npm publish workflow (confiscan package)
- Create Homebrew formula
- Implement standalone binary compilation (pkg/nexe)
- Create README with hook snippets
- Publish to npm registry

#### 3.2 False-Positive Regression Suite
- Curate realistic clean config files
- Create Spring Boot application.yml samples
- Create .env.example samples
- Ensure zero findings on clean corpus

#### 3.3 Documentation
- Create comprehensive README
- Add usage examples
- Document configuration options
- Add troubleshooting guide

### Phase 4: GitHub Action MVP (M4 Milestone)
**Goal**: Maven support, PR comments, free for public repos
**Publication**: GitHub Action will be published to Clinvio organization (Clinvio/cve-comment-scanner)

#### 4.1 Core Utilities
- Implement GitHub API client wrapper (octokit)
- Implement comment marker logic (find-or-create)
- Implement OSV API client

#### 4.2 Maven Integration
- Implement pom.xml parsing
- Implement `mvn dependency:tree` execution
- Implement artifact coordinate extraction

#### 4.3 CVE Detection
- Implement OSV API queries
- Implement CVSS severity mapping
- Implement finding aggregation and sorting

#### 4.4 PR Comment Formatting
- Implement comment template
- Implement severity icons
- Implement update vs new comment logic
- Implement suppressed CVEs section

#### 4.5 Action Configuration
- Create action.yml with inputs/outputs
- Implement fail-on-severity logic
- Implement findings-count output
- Implement highest-severity output

### Phase 5: Monetization (M5 Milestone)
**Goal**: Private repo gating, Marketplace listing

#### 5.1 License Gating
- Implement GitHub Marketplace purchase API integration
- Implement private repo detection
- Implement clear error messages with Marketplace links

#### 5.2 Marketplace Submission
- Prepare action for Marketplace listing
- Create marketing materials
- Submit for review
- Publish to Clinvio GitHub organization
- Configure repository visibility (public for free, private for pro)

## Technical Decisions

### File Type Support
Supported config file extensions:
- `.env` (environment files)
- `.yml`, `.yaml` (YAML configs)
- `.properties` (Java properties)
- `.json` (JSON configs)

### Entropy Calculation
Shannon entropy formula for high-entropy detection:
```
H = -Σ p(x) * log2(p(x))
```
Threshold: 4.0 bits for secrets detection

### Redaction Rule
Format: first 4 + last 2 characters, middle replaced with asterisks
Example: "AKIA1234567890ABCD" → "AKIA****CD"

### Output Formats
1. **Text**: Human-readable with severity colors
2. **JSON**: Machine-readable for CI piping
3. **SARIF**: GitHub code-scanning upload (Pro)

### License Architecture
- JWT stored at ~/.confiscan/license
- Offline validation first
- Graceful degradation to free tier
- Never block scan on license failure

## Testing Strategy

### Unit Tests
- Each rule has positive/negative fixtures
- Test detection accuracy
- Test false-positive filtering
- Test edge cases

### Integration Tests
- Test CLI commands end-to-end
- Test file system operations
- Test git integration
- Test output formatting

### Regression Tests
- False-positive suite on clean configs
- Performance benchmarks
- Memory usage tracking

## Quality Gates

### Before Release
1. All unit tests pass
2. Integration tests pass
3. False-positive suite produces zero findings
4. Performance benchmarks meet targets
5. No TypeScript compilation errors
6. No linting errors

### Performance Targets
- Scan 1000 config files: < 5 seconds
- Memory usage: < 100MB for typical project
- CLI startup time: < 500ms

## Risk Mitigation

### False Positives
- Implement placeholder filtering (env vars, templates)
- Create comprehensive test suite
- Allow user configuration of rules

### Performance
- Implement file streaming for large files
- Use worker threads for parallel scanning
- Cache parsed configurations

### Security
- Never log or transmit scan results
- Redact all matched text
- Validate license keys securely

## Dependencies

### Core Dependencies
- TypeScript
- vitest (testing)
- glob (file matching)
- minimist (CLI args)

### Optional Dependencies
- octokit (GitHub API)
- jose (JWT handling)
- pino (logging)

## Milestones Timeline

| Milestone | Deliverable | Target |
|-----------|-------------|--------|
| M1 | CLI v0.1 (secrets, text output) | Week 1-2 |
| M2 | CLI v1.0 (PII, license, json/sarif) | Week 3-4 |
| M3 | Distribution & polish | Week 5-6 |
| M4 | GitHub Action MVP (Maven) | Week 7-8 |
| M5 | Monetization | Week 9-10 |

## Success Metrics

### Technical
- Detection accuracy: > 95% true positive rate
- False positive rate: < 1% on clean configs
- Performance: Meets targets above

### Product
- npm downloads (post-launch)
- GitHub Marketplace adoption
- User feedback/reviews

## Next Steps

1. **Immediate**: Set up monorepo structure and core types
2. **Short-term**: Implement first 3 secrets rules
3. **Medium-term**: Complete M1 milestone
4. **Long-term**: Ship to npm and GitHub Marketplace