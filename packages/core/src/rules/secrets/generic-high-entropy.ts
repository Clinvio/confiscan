import { Rule, Finding, KeyValuePair } from '../../types';
import { isHighEntropy } from '../../utils/entropy';
import { isPlaceholder } from '../../utils/placeholders';
import { redactMatchedText } from '../../utils/redaction';

export const genericHighEntropyRule: Rule = {
  id: 'secrets.generic-high-entropy',
  category: 'secret',
  severity: 'medium',
  description: 'High-entropy string near sensitive key name detected',
  fileTypes: ['env', 'yml', 'yaml', 'properties', 'json'],
  detect: (fileContent: string, filePath: string, parsedKV: KeyValuePair[]): Finding[] => {
    const findings: Finding[] = [];
    
    // Pattern to match key names that suggest sensitive values
    const sensitiveKeyPattern = /token|secret|password|pwd|credential/i;
    
    for (const kv of parsedKV) {
      if (sensitiveKeyPattern.test(kv.key)) {
        // Check if the value is not a placeholder, has sufficient length, and high entropy
        if (kv.value && !isPlaceholder(kv.value) && kv.value.length >= 20 && isHighEntropy(kv.value, 4.0)) {
          findings.push({
            ruleId: 'secrets.generic-high-entropy',
            file: filePath,
            line: kv.line,
            matchedText: redactMatchedText(kv.value),
            severity: 'medium',
            message: `High-entropy string detected in sensitive field '${kv.key}'. Consider moving to environment variables.`
          });
        }
      }
    }
    
    return findings;
  },
  quickFixHint: 'Move sensitive values to environment variables or a secrets manager.'
};