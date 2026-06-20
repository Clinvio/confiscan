import * as fs from 'fs';
import * as path from 'path';

export async function initCommand(args: string[]): Promise<void> {
  const cwd = process.cwd();
  
  // Create .confiscanrc.json
  const configPath = path.join(cwd, '.confiscanrc.json');
  if (!fs.existsSync(configPath)) {
    const defaultConfig = {
      version: '1.0.0',
      failOn: 'medium',
      ignore: [],
      noPii: false,
      rules: {}
    };
    
    fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2));
    console.log('✓ Created .confiscanrc.json');
  } else {
    console.log('✓ .confiscanrc.json already exists');
  }
  
  // Create pre-commit hook snippet
  const hookPath = path.join(cwd, '.git', 'hooks', 'pre-commit');
  const hookContent = `#!/bin/sh
# Confiscan pre-commit hook
# Scans staged files for secrets and PII before commit

echo "Running confiscan scan on staged files..."
npx confiscan scan --staged
`;
  
  if (!fs.existsSync(hookPath)) {
    fs.writeFileSync(hookPath, hookContent);
    fs.chmodSync(hookPath, '755');
    console.log('✓ Created pre-commit hook at .git/hooks/pre-commit');
  } else {
    console.log('✓ Pre-commit hook already exists');
  }
  
  console.log('\nSetup complete! You can now run:');
  console.log('  confiscan scan              # Scan current directory');
  console.log('  confiscan scan --staged     # Scan staged files');
}