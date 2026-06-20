import { Rule, Finding, KeyValuePair } from '../../types';
import { isPlaceholder, isEnvVarReference } from '../../utils/placeholders';

export const dobFieldRule: Rule = {
  id: 'pii.dob-field',
  category: 'pii',
  severity: 'medium',
  description: 'Hardcoded date of birth detected',
  fileTypes: ['env', 'yml', 'yaml', 'properties', 'json'],
  detect: (fileContent: string, filePath: string, parsedKV: KeyValuePair[]): Finding[] => {
    const findings: Finding[] = [];
    
    // Pattern to match key names that suggest date of birth fields
    const dobKeyPattern = /dob|date_of_birth|birthdate/i;
    
    // Pattern to match date values (various formats)
    const datePattern = /^(?:\d{4}-\d{2}-\d{2}|\d{2}\/\d{2}\/\d{4}|\d{2}-\d{2}-\d{4})$/;
    
    for (const kv of parsedKV) {
      if (dobKeyPattern.test(kv.key)) {
        // Check if the value looks like a real date (not a placeholder)
        if (kv.value && !isPlaceholder(kv.value) && !isEnvVarReference(kv.value) && datePattern.test(kv.value)) {
          findings.push({
            ruleId: 'pii.dob-field',
            file: filePath,
            line: kv.line,
            matchedText: kv.value,
            severity: 'medium',
            message: `Hardcoded date of birth detected in field '${kv.key}'. Move to environment variables or configuration management.`
          });
        }
      }
    }
    
    return findings;
  },
  quickFixHint: 'Move date of birth values to environment variables or configuration management.'
};