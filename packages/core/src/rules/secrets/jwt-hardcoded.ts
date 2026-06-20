import { Rule, Finding, KeyValuePair } from '../../types';
import { findPatternMatches } from '../../utils/regex';
import { redactMatchedText } from '../../utils/redaction';

export const jwtHardcodedRule: Rule = {
  id: 'secrets.jwt-hardcoded',
  category: 'secret',
  severity: 'high',
  description: 'Hardcoded JWT token detected',
  fileTypes: ['env', 'yml', 'yaml', 'properties', 'json'],
  detect: (fileContent: string, filePath: string, parsedKV: KeyValuePair[]): Finding[] => {
    const findings: Finding[] = [];
    
    // Pattern to match JWT tokens: eyJ...}.{signature}
    const jwtPattern = /eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g;
    
    const matches = findPatternMatches(fileContent, jwtPattern);
    
    for (const match of matches) {
      if (match.index !== undefined) {
        // Calculate line number from match index
        const linesBefore = fileContent.substring(0, match.index).split('\n').length;
        
        findings.push({
          ruleId: 'secrets.jwt-hardcoded',
          file: filePath,
          line: linesBefore,
          matchedText: redactMatchedText(match[0]),
          severity: 'high',
          message: 'Hardcoded JWT token detected. Move to environment variables or secrets manager.'
        });
      }
    }
    
    return findings;
  },
  quickFixHint: 'Move JWT tokens to environment variables or a secrets manager.'
};