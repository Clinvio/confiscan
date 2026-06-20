import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { secretsRules } from '../rules/secrets';
import { extractKeyValuePairs } from '../utils/regex';

describe('Secrets Rules', () => {
  const fixturesPath = path.join(__dirname, '../../rules/__fixtures__');

  describe('secrets.private-key-block', () => {
    const rule = secretsRules.find(r => r.id === 'secrets.private-key-block')!;

    it('should detect private key blocks', () => {
      const positiveFixture = fs.readFileSync(
        path.join(fixturesPath, 'secrets.private-key-block/positive/test.env'),
        'utf-8'
      );
      const findings = rule.detect(positiveFixture, 'test.env', []);
      expect(findings.length).toBeGreaterThan(0);
      expect(findings[0].ruleId).toBe('secrets.private-key-block');
    });

    it('should not detect false positives', () => {
      const negativeFixture = fs.readFileSync(
        path.join(fixturesPath, 'secrets.private-key-block/negative/test.env'),
        'utf-8'
      );
      const findings = rule.detect(negativeFixture, 'test.env', []);
      expect(findings.length).toBe(0);
    });
  });

  describe('secrets.aws-access-key', () => {
    const rule = secretsRules.find(r => r.id === 'secrets.aws-access-key')!;

    it('should detect AWS access keys', () => {
      const positiveFixture = fs.readFileSync(
        path.join(fixturesPath, 'secrets.aws-access-key/positive/test.env'),
        'utf-8'
      );
      const findings = rule.detect(positiveFixture, 'test.env', []);
      expect(findings.length).toBeGreaterThan(0);
      expect(findings[0].ruleId).toBe('secrets.aws-access-key');
    });

    it('should not detect false positives', () => {
      const negativeFixture = fs.readFileSync(
        path.join(fixturesPath, 'secrets.aws-access-key/negative/test.env'),
        'utf-8'
      );
      const findings = rule.detect(negativeFixture, 'test.env', []);
      expect(findings.length).toBe(0);
    });
  });

  describe('secrets.jwt-hardcoded', () => {
    const rule = secretsRules.find(r => r.id === 'secrets.jwt-hardcoded')!;

    it('should detect hardcoded JWTs', () => {
      const positiveFixture = fs.readFileSync(
        path.join(fixturesPath, 'secrets.jwt-hardcoded/positive/test.env'),
        'utf-8'
      );
      const findings = rule.detect(positiveFixture, 'test.env', []);
      expect(findings.length).toBeGreaterThan(0);
      expect(findings[0].ruleId).toBe('secrets.jwt-hardcoded');
    });

    it('should not detect false positives', () => {
      const negativeFixture = fs.readFileSync(
        path.join(fixturesPath, 'secrets.jwt-hardcoded/negative/test.env'),
        'utf-8'
      );
      const findings = rule.detect(negativeFixture, 'test.env', []);
      expect(findings.length).toBe(0);
    });
  });

  describe('secrets.slack-webhook', () => {
    const rule = secretsRules.find(r => r.id === 'secrets.slack-webhook')!;

    it('should detect Slack webhooks', () => {
      const positiveFixture = fs.readFileSync(
        path.join(fixturesPath, 'secrets.slack-webhook/positive/test.env'),
        'utf-8'
      );
      const findings = rule.detect(positiveFixture, 'test.env', []);
      expect(findings.length).toBeGreaterThan(0);
      expect(findings[0].ruleId).toBe('secrets.slack-webhook');
    });

    it('should not detect false positives', () => {
      const negativeFixture = fs.readFileSync(
        path.join(fixturesPath, 'secrets.slack-webhook/negative/test.env'),
        'utf-8'
      );
      const findings = rule.detect(negativeFixture, 'test.env', []);
      expect(findings.length).toBe(0);
    });
  });

  describe('secrets.db-connection-string', () => {
    const rule = secretsRules.find(r => r.id === 'secrets.db-connection-string')!;

    it('should detect database connection strings', () => {
      const positiveFixture = fs.readFileSync(
        path.join(fixturesPath, 'secrets.db-connection-string/positive/test.env'),
        'utf-8'
      );
      const findings = rule.detect(positiveFixture, 'test.env', []);
      expect(findings.length).toBeGreaterThan(0);
      expect(findings[0].ruleId).toBe('secrets.db-connection-string');
    });

    it('should not detect false positives', () => {
      const negativeFixture = fs.readFileSync(
        path.join(fixturesPath, 'secrets.db-connection-string/negative/test.env'),
        'utf-8'
      );
      const findings = rule.detect(negativeFixture, 'test.env', []);
      expect(findings.length).toBe(0);
    });
  });

  describe('secrets.generic-api-key', () => {
    const rule = secretsRules.find(r => r.id === 'secrets.generic-api-key')!;

    it('should detect generic API keys', () => {
      const positiveFixture = fs.readFileSync(
        path.join(fixturesPath, 'secrets.generic-api-key/positive/test.env'),
        'utf-8'
      );
      const parsedKV = extractKeyValuePairs(positiveFixture);
      const findings = rule.detect(positiveFixture, 'test.env', parsedKV);
      expect(findings.length).toBeGreaterThan(0);
      expect(findings[0].ruleId).toBe('secrets.generic-api-key');
    });

    it('should not detect false positives', () => {
      const negativeFixture = fs.readFileSync(
        path.join(fixturesPath, 'secrets.generic-api-key/negative/test.env'),
        'utf-8'
      );
      const parsedKV = extractKeyValuePairs(negativeFixture);
      const findings = rule.detect(negativeFixture, 'test.env', parsedKV);
      expect(findings.length).toBe(0);
    });
  });

  describe('secrets.aws-secret-key', () => {
    const rule = secretsRules.find(r => r.id === 'secrets.aws-secret-key')!;

    it('should detect AWS secret keys', () => {
      const positiveFixture = fs.readFileSync(
        path.join(fixturesPath, 'secrets.aws-secret-key/positive/test.env'),
        'utf-8'
      );
      const parsedKV = extractKeyValuePairs(positiveFixture);
      const findings = rule.detect(positiveFixture, 'test.env', parsedKV);
      expect(findings.length).toBeGreaterThan(0);
      expect(findings[0].ruleId).toBe('secrets.aws-secret-key');
    });

    it('should not detect false positives', () => {
      const negativeFixture = fs.readFileSync(
        path.join(fixturesPath, 'secrets.aws-secret-key/negative/test.env'),
        'utf-8'
      );
      const parsedKV = extractKeyValuePairs(negativeFixture);
      const findings = rule.detect(negativeFixture, 'test.env', parsedKV);
      expect(findings.length).toBe(0);
    });
  });

  describe('secrets.generic-high-entropy', () => {
    const rule = secretsRules.find(r => r.id === 'secrets.generic-high-entropy')!;

    it('should detect high-entropy strings', () => {
      const positiveFixture = fs.readFileSync(
        path.join(fixturesPath, 'secrets.generic-high-entropy/positive/test.env'),
        'utf-8'
      );
      const parsedKV = extractKeyValuePairs(positiveFixture);
      const findings = rule.detect(positiveFixture, 'test.env', parsedKV);
      expect(findings.length).toBeGreaterThan(0);
      expect(findings[0].ruleId).toBe('secrets.generic-high-entropy');
    });

    it('should not detect false positives', () => {
      const negativeFixture = fs.readFileSync(
        path.join(fixturesPath, 'secrets.generic-high-entropy/negative/test.env'),
        'utf-8'
      );
      const parsedKV = extractKeyValuePairs(negativeFixture);
      const findings = rule.detect(negativeFixture, 'test.env', parsedKV);
      expect(findings.length).toBe(0);
    });
  });
});