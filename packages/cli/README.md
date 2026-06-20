# Confiscan CLI

**Pre-commit secret scanner for configuration files**

## Installation

### Standalone Binary (Recommended)

Download from [GitHub Releases](https://github.com/Clinvio/confiscan/releases):

```bash
# macOS/Linux
tar -xzf confiscan-*.tar.gz
chmod +x confiscan
sudo mv confiscan /usr/local/bin/
```

### From GitHub

```bash
npm install -g git+https://github.com/Clinvio/confiscan.git
```

## Usage

```bash
# Scan current directory
confiscan scan

# Scan specific path
confiscan scan ./config

# Scan staged files
confiscan scan --staged

# Initialize pre-commit hook
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

### `confiscan init`

Initialize configuration and pre-commit hooks.

## License

MIT © [Clinvio](https://github.com/Clinvio)
