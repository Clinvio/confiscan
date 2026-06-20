import { Rule, Finding, KeyValuePair } from '../../types';
import { findPatternMatches } from '../../utils/regex';
import { redactMatchedText } from '../../utils/redaction';

export const awsAccessKeyRule: Rule = {
  id: 'secrets.aws-access-key',
  category: 'secret',
  severity: 'critical',
  description: 'Hardcoded AWS access key detected',
  fileTypes: ['env', 'yml', 'yaml', 'properties', 'json'],
  detect: (fileContent: string, filePath: string, parsedKV: KeyValuePair[]): Finding[] => {
    const findings: Finding[] = [];
    
    // Pattern to match AWS access keys: AKIA followed by 16 alphanumeric characters
    const awsAccessKeyPattern = /AKIA[0-9A-Z]{16}/g;
    
    const matches = findPatternMatches(fileContent, awsAccessKeyPattern);
    
    for (const match of matches) {
      if (match.index !== undefined) {
        // Calculate line number from match index
        const linesBefore = fileContent.substring(0, match.index).split('\n').length;
        
        findings.push({
          ruleId: 'secrets.aws-access-key',
          file: filePath,
          line: linesBefore,
          matchedText: redactMatchedText(match[0]),
          severity: 'critical',
          message: 'AWS access key detected. Move to environment variables or AWS IAM roles.'
        });
      }
    }
    
    return findings;
  },
  quickFixHint: 'Move AWS credentials to environment variables or use IAM roles.'
};