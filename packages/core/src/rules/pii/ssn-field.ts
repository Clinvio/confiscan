import { Rule, Finding, KeyValuePair } from '../../types';
import { isPlaceholder, isEnvVarReference } from '../../utils/placeholders';

export const ssnFieldRule: Rule = {
  id: 'pii.ssn-field',
  category: 'pii',
  severity: 'high',
  description: 'Hardcoded SSN or national ID detected',
  fileTypes: ['env', 'yml', 'yaml', 'properties', 'json'],
  detect: (fileContent: string, filePath: string, parsedKV: KeyValuePair[]): Finding[] => {
    const findings: Finding[] = [];
    
    // Pattern to match key names that suggest SSN/national ID fields
    const ssnKeyPattern = /ssn|social_security|national_id/i;
    
    // Pattern to match SSN-like values (XXX-XX-XXXX or 9 digits)
    const ssnPattern = /^(?:\d{3}-\d{2}-\d{4}|\d{9})$/;
    
    for (const kv of parsedKV) {
      if (ssnKeyPattern.test(kv.key)) {
        // Check if the value looks like a real SSN (not a placeholder)
        if (kv.value && !isPlaceholder(kv.value) && !isEnvVarReference(kv.value) && ssnPattern.test(kv.value)) {
          findings.push({
            ruleId: 'pii.ssn-field',
            file: filePath,
            line: kv.line,
            matchedText: kv.value,
            severity: 'high',
            message: `Hardcoded SSN/national ID detected in field '${kv.key}'. Move to secure storage.`
          });
        }
      }
    }
    
    return findings;
  },
  quickFixHint: 'Move SSN/national ID values to secure storage or environment variables.'
};