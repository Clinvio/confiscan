import { Rule, Finding, KeyValuePair } from '../../types';
import { isPlaceholder } from '../../utils/placeholders';

export const genericApiKeyRule: Rule = {
  id: 'secrets.generic-api-key',
  category: 'secret',
  severity: 'high',
  description: 'Hardcoded API key detected',
  fileTypes: ['env', 'yml', 'yaml', 'properties', 'json'],
  detect: (fileContent: string, filePath: string, parsedKV: KeyValuePair[]): Finding[] => {
    const findings: Finding[] = [];
    
    // Pattern to match key names that suggest API keys
    const apiKeyPattern = /api[_-]?key/i;
    
    for (const kv of parsedKV) {
      if (apiKeyPattern.test(kv.key)) {
        // Check if the value is not a placeholder
        if (kv.value && !isPlaceholder(kv.value) && kv.value.length > 10) {
          findings.push({
            ruleId: 'secrets.generic-api-key',
            file: filePath,
            line: kv.line,
            matchedText: kv.value,
            severity: 'high',
            message: `API key detected in field '${kv.key}'. Move to environment variables or secrets manager.`
          });
        }
      }
    }
    
    return findings;
  },
  quickFixHint: 'Move API keys to environment variables or a secrets manager.'
};