import { Rule, Finding, KeyValuePair } from '../../types';
import { isPlaceholder, isEnvVarReference } from '../../utils/placeholders';

export const healthFieldRule: Rule = {
  id: 'pii.health-field',
  category: 'pii',
  severity: 'high',
  description: 'Hardcoded healthcare information detected',
  fileTypes: ['env', 'yml', 'yaml', 'properties', 'json'],
  detect: (fileContent: string, filePath: string, parsedKV: KeyValuePair[]): Finding[] => {
    const findings: Finding[] = [];
    
    // Pattern to match key names that suggest healthcare fields
    const healthKeyPattern = /diagnosis|medical|health_record|patient_id/i;
    
    for (const kv of parsedKV) {
      if (healthKeyPattern.test(kv.key)) {
        // Check if the value is not a placeholder
        if (kv.value && !isPlaceholder(kv.value) && !isEnvVarReference(kv.value) && kv.value.length > 3) {
          findings.push({
            ruleId: 'pii.health-field',
            file: filePath,
            line: kv.line,
            matchedText: kv.value,
            severity: 'high',
            message: `Hardcoded healthcare information detected in field '${kv.key}'. Move to secure storage.`
          });
        }
      }
    }
    
    return findings;
  },
  quickFixHint: 'Move healthcare information to secure storage or environment variables.'
};