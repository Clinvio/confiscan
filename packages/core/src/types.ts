export type Severity = 'low' | 'medium' | 'high' | 'critical';

export type Category = 'secret' | 'pii';

export interface KeyValuePair {
  key: string;
  value: string;
  line: number;
  column?: number;
  rawLine: string;
}

export interface Finding {
  ruleId: string;
  file: string;
  line: number;
  column?: number;
  matchedText: string;
  severity: Severity;
  message: string;
}

export interface Rule {
  id: string;
  category: Category;
  severity: Severity;
  description: string;
  fileTypes: string[];
  detect: (fileContent: string, filePath: string, parsedKV: KeyValuePair[]) => Finding[];
  quickFixHint?: string;
}

export interface ScanResult {
  findings: Finding[];
  filesScanned: number;
  duration: number;
}

export interface ScanOptions {
  path: string;
  staged?: boolean;
  format?: 'text' | 'json' | 'sarif';
  failOn?: Severity;
  config?: string;
  ignore?: string[];
  noPii?: boolean;
}