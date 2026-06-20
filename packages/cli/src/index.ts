#!/usr/bin/env node

import { scanCommand } from './commands/scan';
import { initCommand } from './commands/init';
import { licenseCommand } from './commands/license';

const args = process.argv.slice(2);
const command = args[0];

async function main() {
  try {
    switch (command) {
      case 'scan':
        await scanCommand(args.slice(1));
        break;
      case 'init':
        await initCommand(args.slice(1));
        break;
      case 'license':
        await licenseCommand(args.slice(1));
        break;
      default:
        console.log('Usage: confiscan <command> [options]');
        console.log('');
        console.log('Commands:');
        console.log('  scan [path]              Scan a path (default: cwd)');
        console.log('  init                     Initialize configuration');
        console.log('  license <key>            Activate a Pro license');
        console.log('');
        console.log('Options:');
        console.log('  --format <text|json|sarif>  Output format (default: text)');
        console.log('  --fail-on <severity>       Fail on severity threshold (default: medium)');
        console.log('  --staged                   Scan only git-staged files');
        console.log('  --config <path>            Override config file location');
        console.log('  --ignore <glob>            Additional ignore globs');
        console.log('  --no-pii                   Disable PII detection rules');
        process.exit(1);
    }
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();