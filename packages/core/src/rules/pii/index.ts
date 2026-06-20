import { Rule } from '../../types';
import { emailFieldRule } from './email-field';
import { ssnFieldRule } from './ssn-field';
import { phoneFieldRule } from './phone-field';
import { dobFieldRule } from './dob-field';
import { addressFieldRule } from './address-field';
import { healthFieldRule } from './health-field';

export const piiRules: Rule[] = [
  emailFieldRule,
  ssnFieldRule,
  phoneFieldRule,
  dobFieldRule,
  addressFieldRule,
  healthFieldRule
];

export { emailFieldRule } from './email-field';
export { ssnFieldRule } from './ssn-field';
export { phoneFieldRule } from './phone-field';
export { dobFieldRule } from './dob-field';
export { addressFieldRule } from './address-field';
export { healthFieldRule } from './health-field';