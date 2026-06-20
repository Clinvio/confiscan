import { Rule } from '../../types';
import { privateKeyBlockRule } from './private-key-block';
import { awsAccessKeyRule } from './aws-access-key';
import { jwtHardcodedRule } from './jwt-hardcoded';
import { slackWebhookRule } from './slack-webhook';
import { dbConnectionStringRule } from './db-connection-string';
import { genericApiKeyRule } from './generic-api-key';
import { awsSecretKeyRule } from './aws-secret-key';
import { genericHighEntropyRule } from './generic-high-entropy';

export const secretsRules: Rule[] = [
  privateKeyBlockRule,
  awsAccessKeyRule,
  jwtHardcodedRule,
  slackWebhookRule,
  dbConnectionStringRule,
  genericApiKeyRule,
  awsSecretKeyRule,
  genericHighEntropyRule
];

export { privateKeyBlockRule } from './private-key-block';
export { awsAccessKeyRule } from './aws-access-key';
export { jwtHardcodedRule } from './jwt-hardcoded';
export { slackWebhookRule } from './slack-webhook';
export { dbConnectionStringRule } from './db-connection-string';
export { genericApiKeyRule } from './generic-api-key';
export { awsSecretKeyRule } from './aws-secret-key';
export { genericHighEntropyRule } from './generic-high-entropy';