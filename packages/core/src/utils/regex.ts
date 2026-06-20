export function matchesPattern(str: string, pattern: RegExp): boolean {
  return pattern.test(str);
}

export function findPatternMatches(content: string, pattern: RegExp): RegExpMatchArray[] {
  const matches: RegExpMatchArray[] = [];
  let match;

  while ((match = pattern.exec(content)) !== null) {
    matches.push(match);
  }

  return matches;
}

export function extractKeyValuePairs(content: string): Array<{ key: string; value: string; line: number }> {
  const pairs: Array<{ key: string; value: string; line: number }> = [];
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip empty lines and comments
    if (!line || line.startsWith('#') || line.startsWith('//')) {
      continue;
    }

    // Match key=value patterns
    const kvMatch = line.match(/^([^=:\s]+)\s*[=:]\s*(.*)$/);
    if (kvMatch) {
      const key = kvMatch[1].trim();
      let value = kvMatch[2].trim();
      
      // Remove surrounding quotes
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }

      pairs.push({
        key,
        value,
        line: i + 1
      });
    }
  }

  return pairs;
}