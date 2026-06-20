import { Rule, Finding, KeyValuePair } from '../../types';
import { findPatternMatches } from '../../utils/regex';
import { redactMatchedText } from '../../utils/redaction';

export const privateKeyBlockRule: Rule = {
  id: 'secrets.private-key-block',
  category: 'secret',
  severity: 'critical',
  description: 'Hardcoded private key block detected',
  fileTypes: ['env', 'yml', 'yaml', 'properties', 'json'],
  detect: (fileContent: string, filePath: string, parsedKV: KeyValuePair[]): Finding[] => {
    const findings: Finding[] = [];
    
    // Pattern to match private key blocks
    const privateKeyPattern = /-----BEGIN (RSA|EC|OPENSSH|PGP) PRIVATE KEY-----/g;
    
    const matches = findPatternMatches(fileContent, privateKeyPattern);
    
    for (const match of matches) {
      if (match.index !== undefined) {
        // Calculate line number from match index
        const linesBefore = fileContent.substring(0, match.index).split('\n').length;
        
        findings.push({
          ruleId: 'secrets.private-key-block',
          file: filePath,
          line: linesBefore,
          matchedText: redactMatchedText(match[0]),
          severity: 'critical',
          message: `Private key block detected: ${match[1]} type. Move to a secure key management system.`
        });
      }
    }
    
    return findings;
  },
  quickFixHint: 'Move private keys to a secure key management system or environment variables.'
};