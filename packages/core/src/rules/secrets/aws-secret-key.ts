import { Rule, Finding, KeyValuePair } from '../../types';
import { isHighEntropy } from '../../utils/entropy';
import { isPlaceholder } from '../../utils/placeholders';
import { redactMatchedText } from '../../utils/redaction';

export const awsSecretKeyRule: Rule = {
  id: 'secrets.aws-secret-key',
  category: 'secret',
  severity: 'critical',
  description: 'Hardcoded AWS secret key detected',
  fileTypes: ['env', 'yml', 'yaml', 'properties', 'json'],
  detect: (fileContent: string, filePath: string, parsedKV: KeyValuePair[]): Finding[] => {
    const findings: Finding[] = [];
    
    // Pattern to match key names that suggest AWS secret keys
    const awsSecretKeyPattern = /(?:aws[_-]?secret[_-]?access[_-]?key|aws[_-]?secret[_-]?key|secret[_-]?access[_-]?key)/i;
    
    for (const kv of parsedKV) {
      if (awsSecretKeyPattern.test(kv.key)) {
        // Check if the value is not a placeholder and has high entropy
        if (kv.value && !isPlaceholder(kv.value) && kv.value.length >= 20 && isHighEntropy(kv.value, 4.0)) {
          findings.push({
            ruleId: 'secrets.aws-secret-key',
            file: filePath,
            line: kv.line,
            matchedText: redactMatchedText(kv.value),
            severity: 'critical',
            message: `AWS secret key detected in field '${kv.key}'. Move to environment variables or IAM roles.`
          });
        }
      }
    }
    
    return findings;
  },
  quickFixHint: 'Move AWS secret keys to environment variables or use IAM roles.'
};