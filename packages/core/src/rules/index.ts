import { Rule } from '../types';
import { secretsRules } from './secrets';
import { piiRules } from './pii';

export const allRules: Rule[] = [
  ...secretsRules,
  ...piiRules
];

export { secretsRules } from './secrets';
export { piiRules } from './pii';

export function getRulesByCategory(category: 'secret' | 'pii'): Rule[] {
  return allRules.filter(rule => rule.category === category);
}

export function getRuleById(id: string): Rule | undefined {
  return allRules.find(rule => rule.id === id);
}