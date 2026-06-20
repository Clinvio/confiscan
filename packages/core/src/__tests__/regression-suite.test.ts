import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { allRules } from '../rules';
import { extractKeyValuePairs } from '../utils/regex';

describe('False-Positive Regression Suite', () => {
  const regressionPath = path.join(__dirname, '../../rules/__fixtures__/false-positive-regression');

  // Helper function to scan a file and return findings
  const scanFile = (filePath: string): any[] => {
    const content = fs.readFileSync(filePath, 'utf-8');
    const parsedKV = extractKeyValuePairs(content);
    const findings: any[] = [];

    for (const rule of allRules) {
      const ruleFindings = rule.detect(content, path.basename(filePath), parsedKV);
      findings.push(...ruleFindings);
    }

    return findings;
  };

  // Helper function to get all files in a directory recursively
  const getFilesRecursively = (dir: string): string[] => {
    const files: string[] = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        files.push(...getFilesRecursively(fullPath));
      } else {
        files.push(fullPath);
      }
    }

    return files;
  };

  describe('Spring Boot Configurations', () => {
    const springBootPath = path.join(regressionPath, 'spring-boot');

    it('should produce zero findings for application.yml', () => {
      const filePath = path.join(springBootPath, 'application.yml');
      const findings = scanFile(filePath);
      expect(findings).toHaveLength(0);
    });

    it('should produce zero findings for application-dev.yml', () => {
      const filePath = path.join(springBootPath, 'application-dev.yml');
      const findings = scanFile(filePath);
      expect(findings).toHaveLength(0);
    });

    it('should produce zero findings for application-prod.yml', () => {
      const filePath = path.join(springBootPath, 'application-prod.yml');
      const findings = scanFile(filePath);
      expect(findings).toHaveLength(0);
    });

    it('should produce zero findings for bootstrap.yml', () => {
      const filePath = path.join(springBootPath, 'bootstrap.yml');
      const findings = scanFile(filePath);
      expect(findings).toHaveLength(0);
    });
  });

  describe('Environment Example Files', () => {
    const envExamplesPath = path.join(regressionPath, 'env-examples');

    it('should produce zero findings for .env.example', () => {
      const filePath = path.join(envExamplesPath, '.env.example');
      const findings = scanFile(filePath);
      expect(findings).toHaveLength(0);
    });

    it('should produce zero findings for .env.local.example', () => {
      const filePath = path.join(envExamplesPath, '.env.local.example');
      const findings = scanFile(filePath);
      expect(findings).toHaveLength(0);
    });
  });

  describe('Docker Configurations', () => {
    const dockerPath = path.join(regressionPath, 'docker');

    it('should produce zero findings for docker-compose.yml', () => {
      const filePath = path.join(dockerPath, 'docker-compose.yml');
      const findings = scanFile(filePath);
      expect(findings).toHaveLength(0);
    });

    it('should produce zero findings for Dockerfile', () => {
      const filePath = path.join(dockerPath, 'Dockerfile');
      const findings = scanFile(filePath);
      expect(findings).toHaveLength(0);
    });
  });

  describe('Other Configuration Files', () => {
    const otherPath = path.join(regressionPath, 'other');

    it('should produce zero findings for config.json', () => {
      const filePath = path.join(otherPath, 'config.json');
      const findings = scanFile(filePath);
      expect(findings).toHaveLength(0);
    });

    it('should produce zero findings for application.properties', () => {
      const filePath = path.join(otherPath, 'application.properties');
      const findings = scanFile(filePath);
      expect(findings).toHaveLength(0);
    });
  });

  describe('Comprehensive Regression Suite', () => {
    it('should produce zero findings for all regression suite files', () => {
      const allFiles = getFilesRecursively(regressionPath);
      const supportedExtensions = ['.yml', '.yaml', '.env', '.properties', '.json'];
      
      const configFiles = allFiles.filter(file => {
        const ext = path.extname(file).toLowerCase();
        const basename = path.basename(file);
        return supportedExtensions.includes(ext) || 
               basename.endsWith('.env') || 
               basename.includes('.env.');
      });

      const allFindings: Array<{ file: string; findings: any[] }> = [];

      for (const file of configFiles) {
        const findings = scanFile(file);
        if (findings.length > 0) {
          allFindings.push({
            file: path.relative(regressionPath, file),
            findings
          });
        }
      }

      if (allFindings.length > 0) {
        const errorMessage = allFindings.map(({ file, findings }) => {
          const findingDetails = findings.map(f => 
            `  - ${f.ruleId}: ${f.message} (line ${f.line})`
          ).join('\n');
          return `File: ${file}\n${findingDetails}`;
        }).join('\n\n');
        
        expect.fail(`Found unexpected findings in regression suite:\n${errorMessage}`);
      }

      expect(allFindings).toHaveLength(0);
    });

    it('should have at least 10 configuration files in regression suite', () => {
      const allFiles = getFilesRecursively(regressionPath);
      const supportedExtensions = ['.yml', '.yaml', '.env', '.properties', '.json'];
      
      const configFiles = allFiles.filter(file => {
        const ext = path.extname(file).toLowerCase();
        const basename = path.basename(file);
        return supportedExtensions.includes(ext) || 
               basename.endsWith('.env') || 
               basename.includes('.env.');
      });

      expect(configFiles.length).toBeGreaterThanOrEqual(10);
    });
  });

  describe('Specific Pattern Validation', () => {
    it('should not flag environment variable references', () => {
      const testContent = `
DATABASE_URL=\${DATABASE_URL}
DB_PASSWORD=\${DB_PASSWORD}
JWT_SECRET=\${JWT_SECRET}
AWS_ACCESS_KEY_ID=\${AWS_ACCESS_KEY_ID}
      `;
      
      const parsedKV = extractKeyValuePairs(testContent);
      const findings: any[] = [];

      for (const rule of allRules) {
        const ruleFindings = rule.detect(testContent, 'test.env', parsedKV);
        findings.push(...ruleFindings);
      }

      expect(findings).toHaveLength(0);
    });

    it('should not flag placeholder values', () => {
      const testContent = `
API_KEY=your_api_key_here
SECRET=changeme
PASSWORD=example
TOKEN=placeholder
      `;
      
      const parsedKV = extractKeyValuePairs(testContent);
      const findings: any[] = [];

      for (const rule of allRules) {
        const ruleFindings = rule.detect(testContent, 'test.env', parsedKV);
        findings.push(...ruleFindings);
      }

      expect(findings).toHaveLength(0);
    });

    it('should not flag empty values', () => {
      const testContent = `
API_KEY=
SECRET=
PASSWORD=
      `;
      
      const parsedKV = extractKeyValuePairs(testContent);
      const findings: any[] = [];

      for (const rule of allRules) {
        const ruleFindings = rule.detect(testContent, 'test.env', parsedKV);
        findings.push(...ruleFindings);
      }

      expect(findings).toHaveLength(0);
    });

    it('should not flag commented lines', () => {
      const testContent = `
# API_KEY=sk-1234567890abcdef
# SECRET=actual_secret_value
# This is a comment
      `;
      
      const parsedKV = extractKeyValuePairs(testContent);
      const findings: any[] = [];

      for (const rule of allRules) {
        const ruleFindings = rule.detect(testContent, 'test.env', parsedKV);
        findings.push(...ruleFindings);
      }

      expect(findings).toHaveLength(0);
    });
  });
});