# Distribution Plan for Confiscan

## Overview
This plan outlines the steps to distribute Confiscan packages to npmjs.org under the `clinvio.hu` organization and to GitHub under the `Clinvio` organization, ensuring free features are public and paid features are private.

## Credentials Available

### npm (npmjs.org)
- **Access Token**: See credentials/npm/npmjs-org-access-token
- **Organization**: `clinvio-hu` (confirmed)

### GitHub
- **PAT**: See credentials/CREDENTIALS.md
- **Organization**: `Clinvio` (confirmed)
- **User**: `jokerz5575`

## Repository Structure

### Public Repositories (Free Features)
1. **Clinvio/confiscan** - Main CLI tool (free tier)
   - Contains: Core detection engine, CLI wrapper, free secrets rules
   - npm package: `@clinvio.hu/confiscan` (free tier)
   
2. **Clinvio/confiscan-core** - Core detection engine
   - Contains: Shared detection engine, utility functions
   - npm package: `@clinvio.hu/confiscan-core`

3. **Clinvio/cve-comment-scanner** - GitHub Action (free for public repos)
   - Contains: GitHub Action for CVE scanning
   - GitHub Marketplace: Free for public repositories

### Private Repositories (Paid Features)
1. **Clinvio/confiscan-pro** - Pro features
   - Contains: PII rules, JSON/SARIF output, license system
   - npm package: `@clinvio.hu/confiscan-pro` (private, requires license)
   
2. **Clinvio/cve-comment-scanner-pro** - GitHub Action (private repos)
   - Contains: Pro GitHub Action for private repositories
   - GitHub Marketplace: Paid for private repositories

3. **Clinvio/license-server** - License validation server
   - Contains: License validation API, Stripe integration
   - Deployment: Private server

## Distribution Steps

### Step 1: Verify/Create npm Organization
1. Log in to npm using the access token
2. Verify if `clinvio.hu` organization exists
3. If not, create the organization on npmjs.org

### Step 2: Configure npm Authentication
1. Create `.npmrc` file with the access token
2. Configure npm to use the `clinvio.hu` organization scope

### Step 3: Create GitHub Repositories
1. Create public repositories under Clinvio organization:
   - `Clinvio/confiscan`
   - `Clinvio/confiscan-core`
   - `Clinvio/cve-comment-scanner`
   - `Clinvio/homebrew-tap`
   
2. Create private repositories under Clinvio organization:
   - `Clinvio/confiscan-pro`
   - `Clinvio/cve-comment-scanner-pro`
   - `Clinvio/license-server`

### Step 4: Update Package Names
1. Update `packages/cli/package.json`:
   - Change name to `@clinvio-hu/confiscan`
   - Update repository URL to `https://github.com/Clinvio/confiscan`
   - Set version to `1.0.0`
   
2. Update `packages/core/package.json`:
   - Change name to `@clinvio-hu/confiscan-core`
   - Update repository URL to `https://github.com/Clinvio/confiscan-core`
   - Set version to `1.0.0`

### Step 5: Configure GitHub Secrets
1. Add npm token to GitHub repository secrets:
   - `NPM_TOKEN`: See credentials/npm/npmjs-org-access-token
   
2. Add GitHub PAT to repository secrets:
   - `GH_TOKEN`: See credentials/CREDENTIALS.md

### Step 6: Push Code to GitHub
1. Initialize git repository
2. Add remote origin to Clinvio/confiscan
3. Push code to main branch
4. Create initial release tag

### Step 7: Publish to npm
1. Build all packages
2. Run tests
3. Publish `@clinvio.hu/confiscan-core` (public)
4. Publish `@clinvio.hu/confiscan` (public, free tier)

### Step 8: Configure GitHub Actions
1. Update workflow files with correct repository URLs
2. Configure npm publish workflow with organization scope
3. Test CI/CD pipeline

### Step 9: Create GitHub Releases
1. Create initial release (v0.1.0)
2. Upload standalone binaries for all platforms
3. Create Homebrew formula

### Step 10: Verify Distribution
1. Test npm installation: `npm install -g @clinvio.hu/confiscan`
2. Test CLI functionality
3. Verify GitHub Action works
4. Test Homebrew installation

## Package Naming Convention

### npm Packages
- **Free tier**: `@clinvio-hu/confiscan` (public)
- **Pro tier**: `@clinvio-hu/confiscan-pro` (private, requires license)
- **Core engine**: `@clinvio-hu/confiscan-core` (public)

### GitHub Repositories
- **Free CLI**: `Clinvio/confiscan` (public)
- **Pro CLI**: `Clinvio/confiscan-pro` (private)
- **Free Action**: `Clinvio/cve-comment-scanner` (public)
- **Pro Action**: `Clinvio/cve-comment-scanner-pro` (private)
- **Homebrew Tap**: `Clinvio/homebrew-tap` (public)

## Visibility Rules

### Public (Free)
- Core detection engine
- CLI free tier features (secrets rules, text output)
- GitHub Action for public repositories
- Documentation and examples

### Private (Paid)
- Pro features (PII rules, json/sarif output)
- License server implementation
- Stripe integration
- GitHub Action for private repositories

## Security Considerations

1. **Never commit credentials** to repositories
2. **Use GitHub Secrets** for CI/CD workflows
3. **Rotate tokens** periodically
4. **Monitor access** to private repositories
5. **Use environment variables** for sensitive configuration

## Rollback Plan

If distribution fails:
1. Revert package name changes
2. Remove GitHub repositories
3. Unpublish npm packages (within 72 hours)
4. Revoke compromised tokens

## Success Criteria

- [ ] npm packages published under `clinvio.hu` organization
- [ ] GitHub repositories created under `Clinvio` organization
- [ ] Free features accessible without license
- [ ] Pro features require license activation
- [ ] CI/CD pipeline functional
- [ ] Homebrew formula working
- [ ] Standalone binaries available for download