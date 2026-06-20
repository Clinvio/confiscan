export function isPlaceholder(value: string): boolean {
  if (!value || value.length === 0) {
    return true;
  }

  // Environment variable references
  if (/^\$\{[^}]+\}$/.test(value)) {
    return true;
  }
  if (/^\$[A-Z_][A-Z0-9_]*$/.test(value)) {
    return true;
  }

  // Template literals
  if (/^\{\{[^}]+\}\}$/.test(value)) {
    return true;
  }

  // Common placeholder values
  const placeholderPatterns = [
    /^(changeme|change_me|placeholder|example|sample|test|dummy|foo|bar|baz)$/i,
    /^x+$/i,
    /^\*+$/,
    /^-+$/,
    /^_+$/,
    /^0+$/,
    /^(null|undefined|empty|blank)$/i,
    /^(your_|my_|our_)/i,
    /(_here|_placeholder|_example|_sample|_test)$/i
  ];

  for (const pattern of placeholderPatterns) {
    if (pattern.test(value)) {
      return true;
    }
  }

  return false;
}

export function isEnvVarReference(value: string): boolean {
  return /^\$\{[^}]+\}$/.test(value) || /^\$[A-Z_][A-Z0-9_]*$/.test(value);
}