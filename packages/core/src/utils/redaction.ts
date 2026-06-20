export function redactSensitiveText(text: string): string {
  if (!text || text.length <= 6) {
    return text;
  }

  const firstFour = text.slice(0, 4);
  const lastTwo = text.slice(-2);
  const middleLength = text.length - 6;
  const asterisks = '*'.repeat(Math.min(middleLength, 20)); // Cap at 20 asterisks for readability

  return `${firstFour}${asterisks}${lastTwo}`;
}

export function redactMatchedText(matchedText: string): string {
  return redactSensitiveText(matchedText);
}