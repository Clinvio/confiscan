import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { piiRules } from '../rules/pii';
import { extractKeyValuePairs } from '../utils/regex';

describe('PII Rules', () => {
  const fixturesPath = path.join(__dirname, '../../rules/__fixtures__');

  describe('pii.email-field', () => {
    const rule = piiRules.find(r => r.id === 'pii.email-field')!;

    it('should detect hardcoded email addresses', () => {
      const positiveFixture = fs.readFileSync(
        path.join(fixturesPath, 'pii.email-field/positive/test.env'),
        'utf-8'
      );
      const parsedKV = extractKeyValuePairs(positiveFixture);
      const findings = rule.detect(positiveFixture, 'test.env', parsedKV);
      expect(findings.length).toBeGreaterThan(0);
      expect(findings[0].ruleId).toBe('pii.email-field');
    });

    it('should not detect false positives', () => {
      const negativeFixture = fs.readFileSync(
        path.join(fixturesPath, 'pii.email-field/negative/test.env'),
        'utf-8'
      );
      const parsedKV = extractKeyValuePairs(negativeFixture);
      const findings = rule.detect(negativeFixture, 'test.env', parsedKV);
      expect(findings.length).toBe(0);
    });
  });

  describe('pii.ssn-field', () => {
    const rule = piiRules.find(r => r.id === 'pii.ssn-field')!;

    it('should detect hardcoded SSNs', () => {
      const positiveFixture = fs.readFileSync(
        path.join(fixturesPath, 'pii.ssn-field/positive/test.env'),
        'utf-8'
      );
      const parsedKV = extractKeyValuePairs(positiveFixture);
      const findings = rule.detect(positiveFixture, 'test.env', parsedKV);
      expect(findings.length).toBeGreaterThan(0);
      expect(findings[0].ruleId).toBe('pii.ssn-field');
    });

    it('should not detect false positives', () => {
      const negativeFixture = fs.readFileSync(
        path.join(fixturesPath, 'pii.ssn-field/negative/test.env'),
        'utf-8'
      );
      const parsedKV = extractKeyValuePairs(negativeFixture);
      const findings = rule.detect(negativeFixture, 'test.env', parsedKV);
      expect(findings.length).toBe(0);
    });
  });

  describe('pii.phone-field', () => {
    const rule = piiRules.find(r => r.id === 'pii.phone-field')!;

    it('should detect hardcoded phone numbers', () => {
      const positiveFixture = fs.readFileSync(
        path.join(fixturesPath, 'pii.phone-field/positive/test.env'),
        'utf-8'
      );
      const parsedKV = extractKeyValuePairs(positiveFixture);
      const findings = rule.detect(positiveFixture, 'test.env', parsedKV);
      expect(findings.length).toBeGreaterThan(0);
      expect(findings[0].ruleId).toBe('pii.phone-field');
    });

    it('should not detect false positives', () => {
      const negativeFixture = fs.readFileSync(
        path.join(fixturesPath, 'pii.phone-field/negative/test.env'),
        'utf-8'
      );
      const parsedKV = extractKeyValuePairs(negativeFixture);
      const findings = rule.detect(negativeFixture, 'test.env', parsedKV);
      expect(findings.length).toBe(0);
    });
  });

  describe('pii.dob-field', () => {
    const rule = piiRules.find(r => r.id === 'pii.dob-field')!;

    it('should detect hardcoded dates of birth', () => {
      const positiveFixture = fs.readFileSync(
        path.join(fixturesPath, 'pii.dob-field/positive/test.env'),
        'utf-8'
      );
      const parsedKV = extractKeyValuePairs(positiveFixture);
      const findings = rule.detect(positiveFixture, 'test.env', parsedKV);
      expect(findings.length).toBeGreaterThan(0);
      expect(findings[0].ruleId).toBe('pii.dob-field');
    });

    it('should not detect false positives', () => {
      const negativeFixture = fs.readFileSync(
        path.join(fixturesPath, 'pii.dob-field/negative/test.env'),
        'utf-8'
      );
      const parsedKV = extractKeyValuePairs(negativeFixture);
      const findings = rule.detect(negativeFixture, 'test.env', parsedKV);
      expect(findings.length).toBe(0);
    });
  });

  describe('pii.address-field', () => {
    const rule = piiRules.find(r => r.id === 'pii.address-field')!;

    it('should detect hardcoded addresses', () => {
      const positiveFixture = fs.readFileSync(
        path.join(fixturesPath, 'pii.address-field/positive/test.env'),
        'utf-8'
      );
      const parsedKV = extractKeyValuePairs(positiveFixture);
      const findings = rule.detect(positiveFixture, 'test.env', parsedKV);
      expect(findings.length).toBeGreaterThan(0);
      expect(findings[0].ruleId).toBe('pii.address-field');
    });

    it('should not detect false positives', () => {
      const negativeFixture = fs.readFileSync(
        path.join(fixturesPath, 'pii.address-field/negative/test.env'),
        'utf-8'
      );
      const parsedKV = extractKeyValuePairs(negativeFixture);
      const findings = rule.detect(negativeFixture, 'test.env', parsedKV);
      expect(findings.length).toBe(0);
    });
  });

  describe('pii.health-field', () => {
    const rule = piiRules.find(r => r.id === 'pii.health-field')!;

    it('should detect hardcoded healthcare information', () => {
      const positiveFixture = fs.readFileSync(
        path.join(fixturesPath, 'pii.health-field/positive/test.env'),
        'utf-8'
      );
      const parsedKV = extractKeyValuePairs(positiveFixture);
      const findings = rule.detect(positiveFixture, 'test.env', parsedKV);
      expect(findings.length).toBeGreaterThan(0);
      expect(findings[0].ruleId).toBe('pii.health-field');
    });

    it('should not detect false positives', () => {
      const negativeFixture = fs.readFileSync(
        path.join(fixturesPath, 'pii.health-field/negative/test.env'),
        'utf-8'
      );
      const parsedKV = extractKeyValuePairs(negativeFixture);
      const findings = rule.detect(negativeFixture, 'test.env', parsedKV);
      expect(findings.length).toBe(0);
    });
  });
});