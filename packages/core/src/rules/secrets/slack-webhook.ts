import { Rule, Finding, KeyValuePair } from '../../types';
import { findPatternMatches } from '../../utils/regex';
import { redactMatchedText } from '../../utils/redaction';

export const slackWebhookRule: Rule = {
  id: 'secrets.slack-webhook',
  category: 'secret',
  severity: 'high',
  description: 'Hardcoded Slack webhook URL detected',
  fileTypes: ['env', 'yml', 'yaml', 'properties', 'json'],
  detect: (fileContent: string, filePath: string, parsedKV: KeyValuePair[]): Finding[] => {
    const findings: Finding[] = [];
    
    // Pattern to match Slack webhook URLs
    const slackWebhookPattern = /hooks\.slack\.com\/services\/T[A-Z0-9]+\/B[A-Z0-9]+\/[A-Za-z0-9]+/g;
    
    const matches = findPatternMatches(fileContent, slackWebhookPattern);
    
    for (const match of matches) {
      if (match.index !== undefined) {
        // Calculate line number from match index
        const linesBefore = fileContent.substring(0, match.index).split('\n').length;
        
        findings.push({
          ruleId: 'secrets.slack-webhook',
          file: filePath,
          line: linesBefore,
          matchedText: redactMatchedText(match[0]),
          severity: 'high',
          message: 'Slack webhook URL detected. Move to environment variables or secrets manager.'
        });
      }
    }
    
    return findings;
  },
  quickFixHint: 'Move Slack webhook URLs to environment variables or a secrets manager.'
};