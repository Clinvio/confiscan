import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { allRules } from '../rules';
import { extractKeyValuePairs } from '../utils/regex';

describe('False-Positive Regression Suite', () => {
  const regressionPath = path.join(__dirname, '../../rules/__fixtures__/false-positive-regression');

  it('should produce zero findings for application.yml', () => {
    const content = fs.readFileSync(path.join(regressionPath, 'application.yml'), 'utf-8');
    const parsedKV = extractKeyValuePairs(content);
    const findings: any[] = [];

    for (const rule of allRules) {
      const ruleFindings = rule.detect(content, 'application.yml', parsedKV);
      findings.push(...ruleFindings);
    }

    expect(findings.length).toBe(0);
  });

  it('should produce zero findings for .env.example', () => {
    const content = fs.readFileSync(path.join(regressionPath, '.env.example'), 'utf-8');
    const parsedKV = extractKeyValuePairs(content);
    const findings: any[] = [];

    for (const rule of allRules) {
      const ruleFindings = rule.detect(content, '.env.example', parsedKV);
      findings.push(...ruleFindings);
    }

    expect(findings.length).toBe(0);
  });
});