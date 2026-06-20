import * as fs from 'fs';
import * as path from 'path';
import { allRules, Finding, ScanResult, Severity } from '@clinvio-hu/confiscan-core';
import { extractKeyValuePairs } from '@clinvio-hu/confiscan-core/utils';
import { LicenseManager } from '@clinvio-hu/confiscan-core/utils/license';

interface ScanOptions {
  path: string;
  staged: boolean;
  format: 'text' | 'json' | 'sarif';
  failOn: Severity;
  config?: string;
  ignore: string[];
  noPii: boolean;
}

export async function scanCommand(args: string[]): Promise<void> {
  const options = parseScanArgs(args);
  const startTime = Date.now();
  
  // Check license status
  const licenseManager = new LicenseManager();
  const hasLicense = await licenseManager.checkLicense();
  const isPro = hasLicense && licenseManager.isPro();
  
  // Load configuration
  const config = loadConfiguration(options.config);
  
  // Get files to scan
  const files = await getFilesToScan(options);
  
  // Scan files
  const findings: Finding[] = [];
  let filesScanned = 0;
  
  for (const file of files) {
    try {
      const content = fs.readFileSync(file, 'utf-8');
      const parsedKV = extractKeyValuePairs(content);
      
      // Apply rules
      for (const rule of allRules) {
        // Skip PII rules if --no-pii flag is set or if not Pro
        if ((options.noPii || !isPro) && rule.category === 'pii') {
          continue;
        }
        
        const ruleFindings = rule.detect(content, file, parsedKV);
        findings.push(...ruleFindings);
      }
      
      filesScanned++;
    } catch (error) {
      console.error(`Error scanning file ${file}:`, error instanceof Error ? error.message : error);
    }
  }
  
  const duration = Date.now() - startTime;
  const result: ScanResult = {
    findings,
    filesScanned,
    duration
  };
  
  // Output results
  outputResults(result, options, isPro);
  
  // Exit with appropriate code
  const shouldFail = findings.some(f => 
    getSeverityLevel(f.severity) >= getSeverityLevel(options.failOn)
  );
  
  process.exit(shouldFail ? 1 : 0);
}

function parseScanArgs(args: string[]): ScanOptions {
  const options: ScanOptions = {
    path: process.cwd(),
    staged: false,
    format: 'text',
    failOn: 'medium',
    ignore: [],
    noPii: false
  };
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case '--staged':
        options.staged = true;
        break;
      case '--format':
        options.format = args[++i] as 'text' | 'json' | 'sarif';
        break;
      case '--fail-on':
        options.failOn = args[++i] as Severity;
        break;
      case '--config':
        options.config = args[++i];
        break;
      case '--ignore':
        options.ignore.push(args[++i]);
        break;
      case '--no-pii':
        options.noPii = true;
        break;
      default:
        if (!arg.startsWith('-')) {
          options.path = arg;
        }
        break;
    }
  }
  
  return options;
}

interface Config {
  version: string;
  failOn: Severity;
  ignore: string[];
  noPii: boolean;
  rules: Record<string, any>;
}

function loadConfiguration(configPath?: string): Config {
  const defaultConfig: Config = {
    version: '1.0.0',
    failOn: 'medium',
    ignore: [],
    noPii: false,
    rules: {}
  };

  try {
    // Try to find config file
    let configFilePath = configPath;
    if (!configFilePath) {
      // Look for .confiscanrc.json in current directory
      const cwd = process.cwd();
      const defaultConfigPath = path.join(cwd, '.confiscanrc.json');
      if (fs.existsSync(defaultConfigPath)) {
        configFilePath = defaultConfigPath;
      }
    }

    if (configFilePath && fs.existsSync(configFilePath)) {
      const configContent = fs.readFileSync(configFilePath, 'utf-8');
      const userConfig = JSON.parse(configContent);
      return { ...defaultConfig, ...userConfig };
    }
  } catch (error) {
    console.error('Warning: Error loading configuration:', error instanceof Error ? error.message : error);
  }

  return defaultConfig;
}

async function getFilesToScan(options: ScanOptions): Promise<string[]> {
  const files: string[] = [];
  const targetPath = path.resolve(options.path);
  
  if (options.staged) {
    // Get staged files from git
    const { execSync } = require('child_process');
    try {
      const stagedFiles = execSync('git diff --cached --name-only --diff-filter=ACM', {
        cwd: targetPath,
        encoding: 'utf-8'
      }).trim().split('\n').filter(Boolean);
      
      for (const file of stagedFiles) {
        const fullPath = path.join(targetPath, file);
        if (fs.existsSync(fullPath) && isSupportedFileType(file) && !shouldIgnoreFile(file, options.ignore)) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      console.error('Error getting staged files:', error instanceof Error ? error.message : error);
    }
  } else {
    // Recursively find files
    const walkDir = (dir: string) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const relativePath = path.relative(targetPath, fullPath);
        
        // Skip ignored directories
        if (entry.isDirectory() && (shouldIgnoreDir(entry.name) || shouldIgnoreFile(relativePath, options.ignore))) {
          continue;
        }
        
        if (entry.isFile() && isSupportedFileType(entry.name) && !shouldIgnoreFile(relativePath, options.ignore)) {
          files.push(fullPath);
        } else if (entry.isDirectory()) {
          walkDir(fullPath);
        }
      }
    };
    
    walkDir(targetPath);
  }
  
  return files;
}

function shouldIgnoreFile(filePath: string, ignorePatterns: string[]): boolean {
  // Check against ignore patterns
  for (const pattern of ignorePatterns) {
    if (matchesGlobPattern(filePath, pattern)) {
      return true;
    }
  }
  return false;
}

function matchesGlobPattern(filePath: string, pattern: string): boolean {
  // Simple glob pattern matching
  // Convert glob pattern to regex
  const regexPattern = pattern
    .replace(/\./g, '\\.')
    .replace(/\*/g, '.*')
    .replace(/\?/g, '.');
  
  const regex = new RegExp(`^${regexPattern}$`, 'i');
  return regex.test(filePath);
}

function isSupportedFileType(filename: string): boolean {
  const supportedExtensions = ['.env', '.yml', '.yaml', '.properties', '.json'];
  const ext = path.extname(filename).toLowerCase();
  return supportedExtensions.includes(ext) || filename.endsWith('.env');
}

function shouldIgnoreDir(dirname: string): boolean {
  const ignoredDirs = ['node_modules', '.git', 'dist', 'build', 'credentials'];
  return ignoredDirs.includes(dirname);
}

function outputResults(result: ScanResult, options: ScanOptions, isPro: boolean): void {
  // Check if Pro license is required for json/sarif formats
  if ((options.format === 'json' || options.format === 'sarif') && !isPro) {
    console.log('Warning: JSON and SARIF output formats require a Pro license.');
    console.log('Falling back to text output format.');
    console.log('Run "confiscan license <key>" to activate Pro features.');
    console.log('');
    outputText(result);
    return;
  }

  switch (options.format) {
    case 'text':
      outputText(result);
      break;
    case 'json':
      outputJson(result);
      break;
    case 'sarif':
      outputSarif(result);
      break;
  }
}

function outputText(result: ScanResult): void {
  if (result.findings.length === 0) {
    console.log(`✓ No findings. Scanned ${result.filesScanned} files in ${result.duration}ms.`);
    return;
  }
  
  console.log(`Found ${result.findings.length} findings in ${result.filesScanned} files (${result.duration}ms):\n`);
  
  for (const finding of result.findings) {
    const severityIcon = getSeverityIcon(finding.severity);
    console.log(`${severityIcon} [${finding.severity.toUpperCase()}] ${finding.ruleId}  ${finding.file}:${finding.line}`);
    console.log(`  ${finding.message}`);
    console.log(`  Matched: ${finding.matchedText}`);
    console.log('');
  }
}

function outputJson(result: ScanResult): void {
  const output = {
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    summary: {
      findingsCount: result.findings.length,
      filesScanned: result.filesScanned,
      durationMs: result.duration,
      severityCounts: {
        critical: result.findings.filter(f => f.severity === 'critical').length,
        high: result.findings.filter(f => f.severity === 'high').length,
        medium: result.findings.filter(f => f.severity === 'medium').length,
        low: result.findings.filter(f => f.severity === 'low').length
      }
    },
    findings: result.findings.map(finding => ({
      ruleId: finding.ruleId,
      severity: finding.severity,
      file: finding.file,
      line: finding.line,
      column: finding.column,
      message: finding.message,
      matchedText: finding.matchedText
    }))
  };
  
  console.log(JSON.stringify(output, null, 2));
}

function outputSarif(result: ScanResult): void {
  // SARIF format implementation
  const sarif = {
    $schema: 'https://raw.githubusercontent.com/oasis-tcs/sarif-spec/master/Schemata/sarif-schema-2.1.0.json',
    version: '2.1.0',
    $comment: 'SARIF output generated by confiscan - Secret and PII scanner',
    runs: [{
      tool: {
        driver: {
          name: 'confiscan',
          version: '1.0.0',
          informationUri: 'https://github.com/Clinvio/confiscan',
          rules: allRules.map(rule => ({
            id: rule.id,
            name: rule.id,
            shortDescription: { text: rule.description },
            defaultConfiguration: { level: mapSeverityToSarifLevel(rule.severity) },
            properties: {
              category: rule.category,
              severity: rule.severity
            }
          }))
        }
      },
      results: result.findings.map(finding => ({
        ruleId: finding.ruleId,
        level: mapSeverityToSarifLevel(finding.severity),
        message: { text: finding.message },
        locations: [{
          physicalLocation: {
            artifactLocation: { 
              uri: finding.file,
              description: { text: `File containing ${finding.ruleId} finding` }
            },
            region: { 
              startLine: finding.line,
              startColumn: finding.column || 1
            }
          }
        }],
        properties: {
          matchedText: finding.matchedText
        }
      })),
      properties: {
        scanSummary: {
          findingsCount: result.findings.length,
          filesScanned: result.filesScanned,
          durationMs: result.duration
        }
      }
    }]
  };
  
  console.log(JSON.stringify(sarif, null, 2));
}

function mapSeverityToSarifLevel(severity: Severity): string {
  switch (severity) {
    case 'critical':
    case 'high':
      return 'error';
    case 'medium':
      return 'warning';
    case 'low':
      return 'note';
    default:
      return 'warning';
  }
}

function getSeverityIcon(severity: Severity): string {
  switch (severity) {
    case 'critical': return '🔴';
    case 'high': return '🟠';
    case 'medium': return '🟡';
    case 'low': return '🟢';
    default: return '⚪';
  }
}

function getSeverityLevel(severity: Severity): number {
  switch (severity) {
    case 'low': return 0;
    case 'medium': return 1;
    case 'high': return 2;
    case 'critical': return 3;
    default: return 0;
  }
}