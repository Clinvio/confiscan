import { Rule, Finding, KeyValuePair } from '../../types';
import { findPatternMatches } from '../../utils/regex';
import { redactMatchedText } from '../../utils/redaction';

export const dbConnectionStringRule: Rule = {
  id: 'secrets.db-connection-string',
  category: 'secret',
  severity: 'critical',
  description: 'Hardcoded database connection string with password detected',
  fileTypes: ['env', 'yml', 'yaml', 'properties', 'json'],
  detect: (fileContent: string, filePath: string, parsedKV: KeyValuePair[]): Finding[] => {
    const findings: Finding[] = [];
    
    // Pattern to match database connection strings with passwords
    // Matches patterns like: jdbc:mysql://user:pass@host, postgres://user:pass@host, etc.
    const dbConnectionStringPattern = /(?:jdbc:|postgres(?:ql)?:|mysql:|mongodb(?:\+srv)?:|redis:|amqp:|smtp:)[^\s]*:\/\/[^:]+:([^@\s]+)@[^\s]+/gi;
    
    const matches = findPatternMatches(fileContent, dbConnectionStringPattern);
    
    for (const match of matches) {
      if (match.index !== undefined && match[1]) {
        // Calculate line number from match index
        const linesBefore = fileContent.substring(0, match.index).split('\n').length;
        
        // Check if the password is not a placeholder
        const password = match[1];
        if (password.length > 0 && !/^\$\{[^}]+\}$/.test(password) && !/^[*_-]+$/.test(password)) {
          findings.push({
            ruleId: 'secrets.db-connection-string',
            file: filePath,
            line: linesBefore,
            matchedText: redactMatchedText(match[0]),
            severity: 'critical',
            message: 'Database connection string with hardcoded password detected. Move to environment variables.'
          });
        }
      }
    }
    
    return findings;
  },
  quickFixHint: 'Move database credentials to environment variables or a secrets manager.'
};