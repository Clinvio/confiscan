import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { execSync } from 'child_process';

describe('Scan Command Integration', () => {
  let tempDir: string;
  let cliPath: string;

  beforeAll(() => {
    // Create temporary directory
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'confiscan-test-'));
    
    // Create test files
    fs.writeFileSync(path.join(tempDir, 'test.env'), `
# Test configuration
API_KEY=sk-1234567890abcdef1234567890abcdef
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
EMAIL=john.doe@example.com
DATABASE_URL=postgresql://user:password123@localhost:5432/mydb
`);
    
    fs.writeFileSync(path.join(tempDir, 'config.yml'), `
app:
  name: test-app
  secret_token: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0
  jwt: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
`);
    
    // Path to CLI (assuming it's built)
    cliPath = path.join(__dirname, '../../dist/index.js');
  });

  afterAll(() => {
    // Clean up temporary directory
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it('should scan directory and find secrets', () => {
    try {
      const output = execSync(`node ${cliPath} scan ${tempDir}`, {
        encoding: 'utf-8',
        timeout: 10000
      });
      
      // Should find multiple findings
      expect(output).toContain('Found');
      expect(output).toContain('findings');
    } catch (error: any) {
      // Exit code 1 means findings were found (expected)
      if (error.status === 1) {
        expect(error.stdout).toContain('Found');
        expect(error.stdout).toContain('findings');
      } else {
        throw error;
      }
    }
  });

  it('should scan with text format output', () => {
    try {
      const output = execSync(`node ${cliPath} scan ${tempDir} --format text`, {
        encoding: 'utf-8',
        timeout: 10000
      });
      
      // Should contain text format indicators
      expect(output).toContain('[');
      expect(output).toContain(']');
    } catch (error: any) {
      if (error.status === 1) {
        expect(error.stdout).toContain('[');
        expect(error.stdout).toContain(']');
      } else {
        throw error;
      }
    }
  });

  it('should scan with json format output', () => {
    try {
      const output = execSync(`node ${cliPath} scan ${tempDir} --format json`, {
        encoding: 'utf-8',
        timeout: 10000
      });
      
      // Should be valid JSON
      const parsed = JSON.parse(output);
      expect(parsed).toHaveProperty('findings');
      expect(parsed).toHaveProperty('filesScanned');
      expect(parsed).toHaveProperty('duration');
    } catch (error: any) {
      if (error.status === 1) {
        const parsed = JSON.parse(error.stdout);
        expect(parsed).toHaveProperty('findings');
        expect(parsed).toHaveProperty('filesScanned');
        expect(parsed).toHaveProperty('duration');
      } else {
        throw error;
      }
    }
  });

  it('should respect fail-on threshold', () => {
    try {
      const output = execSync(`node ${cliPath} scan ${tempDir} --fail-on critical`, {
        encoding: 'utf-8',
        timeout: 10000
      });
      
      // Should succeed if no critical findings
      expect(output).toContain('✓');
    } catch (error: any) {
      // If there are critical findings, it should fail
      if (error.status === 1) {
        expect(error.stdout).toContain('Found');
      } else {
        throw error;
      }
    }
  });
});