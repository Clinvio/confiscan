import { Rule, Finding, KeyValuePair } from '../../types';
import { isPlaceholder, isEnvVarReference } from '../../utils/placeholders';

export const addressFieldRule: Rule = {
  id: 'pii.address-field',
  category: 'pii',
  severity: 'medium',
  description: 'Hardcoded address detected',
  fileTypes: ['env', 'yml', 'yaml', 'properties', 'json'],
  detect: (fileContent: string, filePath: string, parsedKV: KeyValuePair[]): Finding[] => {
    const findings: Finding[] = [];
    
    // Pattern to match key names that suggest address fields
    const addressKeyPattern = /address|street|zipcode|postal/i;
    
    // Simple check for address-like values (not empty, not placeholder)
    for (const kv of parsedKV) {
      if (addressKeyPattern.test(kv.key)) {
        // Check if the value looks like a real address (not a placeholder)
        if (kv.value && !isPlaceholder(kv.value) && !isEnvVarReference(kv.value) && kv.value.length > 10) {
          // Basic check for address-like content (numbers and letters)
          if (/[0-9]/.test(kv.value) && /[a-zA-Z]/.test(kv.value)) {
            findings.push({
              ruleId: 'pii.address-field',
              file: filePath,
              line: kv.line,
              matchedText: kv.value,
              severity: 'medium',
              message: `Hardcoded address detected in field '${kv.key}'. Move to environment variables or configuration management.`
            });
          }
        }
      }
    }
    
    return findings;
  },
  quickFixHint: 'Move address values to environment variables or configuration management.'
};