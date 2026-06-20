import { Rule, Finding, KeyValuePair } from '../../types';
import { isPlaceholder, isEnvVarReference } from '../../utils/placeholders';

export const emailFieldRule: Rule = {
  id: 'pii.email-field',
  category: 'pii',
  severity: 'medium',
  description: 'Hardcoded email address detected',
  fileTypes: ['env', 'yml', 'yaml', 'properties', 'json'],
  detect: (fileContent: string, filePath: string, parsedKV: KeyValuePair[]): Finding[] => {
    const findings: Finding[] = [];
    
    // Pattern to match key names that suggest email fields
    const emailKeyPattern = /email/i;
    
    // Pattern to match real email addresses
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    for (const kv of parsedKV) {
      if (emailKeyPattern.test(kv.key)) {
        // Check if the value looks like a real email address (not a placeholder)
        if (kv.value && !isPlaceholder(kv.value) && !isEnvVarReference(kv.value) && emailPattern.test(kv.value)) {
          findings.push({
            ruleId: 'pii.email-field',
            file: filePath,
            line: kv.line,
            matchedText: kv.value,
            severity: 'medium',
            message: `Hardcoded email address detected in field '${kv.key}'. Move to environment variables or configuration management.`
          });
        }
      }
    }
    
    return findings;
  },
  quickFixHint: 'Move email addresses to environment variables or configuration management.'
};