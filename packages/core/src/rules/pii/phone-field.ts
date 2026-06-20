import { Rule, Finding, KeyValuePair } from '../../types';
import { isPlaceholder, isEnvVarReference } from '../../utils/placeholders';

export const phoneFieldRule: Rule = {
  id: 'pii.phone-field',
  category: 'pii',
  severity: 'medium',
  description: 'Hardcoded phone number detected',
  fileTypes: ['env', 'yml', 'yaml', 'properties', 'json'],
  detect: (fileContent: string, filePath: string, parsedKV: KeyValuePair[]): Finding[] => {
    const findings: Finding[] = [];
    
    // Pattern to match key names that suggest phone fields
    const phoneKeyPattern = /phone|mobile|tel(ephone)?/i;
    
    // Pattern to match phone number values (various formats)
    const phonePattern = /^(?:\+?1?[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}$/;
    
    for (const kv of parsedKV) {
      if (phoneKeyPattern.test(kv.key)) {
        // Check if the value looks like a real phone number (not a placeholder)
        if (kv.value && !isPlaceholder(kv.value) && !isEnvVarReference(kv.value) && phonePattern.test(kv.value)) {
          findings.push({
            ruleId: 'pii.phone-field',
            file: filePath,
            line: kv.line,
            matchedText: kv.value,
            severity: 'medium',
            message: `Hardcoded phone number detected in field '${kv.key}'. Move to environment variables or configuration management.`
          });
        }
      }
    }
    
    return findings;
  },
  quickFixHint: 'Move phone numbers to environment variables or configuration management.'
};