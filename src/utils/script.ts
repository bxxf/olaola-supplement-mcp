export function extractFunctionCallArgument(source: string, functionName: string): string | null {
  const callStart = source.indexOf(`${functionName}(`);
  if (callStart < 0) return null;

  const argumentStart = callStart + functionName.length + 1;
  return readBalancedValue(source, argumentStart);
}

export function extractQuotedObjectProperty(source: string, propertyName: string): string | null {
  const quotedProperty = `"${propertyName}"`;
  const propertyStart = source.indexOf(quotedProperty);
  if (propertyStart < 0) return null;

  const colonIndex = source.indexOf(":", propertyStart + quotedProperty.length);
  if (colonIndex < 0) return null;

  return readJsonString(source, colonIndex + 1);
}

function readBalancedValue(source: string, startIndex: number): string | null {
  const opening = source[startIndex];
  const closing = opening === "{" ? "}" : opening === "[" ? "]" : null;
  if (!closing) return null;

  let depth = 0;
  let quote: string | null = null;
  let escaped = false;

  for (let index = startIndex; index < source.length; index += 1) {
    const char = source[index];
    if (!char) return null;

    if (quote) {
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === quote) {
        quote = null;
      }
      continue;
    }

    if (char === '"' || char === "'") {
      quote = char;
      continue;
    }

    if (char === opening) depth += 1;
    if (char === closing) depth -= 1;
    if (depth === 0) return source.slice(startIndex, index + 1);
  }

  return null;
}

function readJsonString(source: string, startIndex: number): string | null {
  const quoteStart = findNextNonWhitespace(source, startIndex);
  if (source[quoteStart] !== '"') return null;

  let escaped = false;
  for (let index = quoteStart + 1; index < source.length; index += 1) {
    const char = source[index];
    if (!char) return null;

    if (escaped) {
      escaped = false;
      continue;
    }

    if (char === "\\") {
      escaped = true;
      continue;
    }

    if (char === '"') {
      return JSON.parse(source.slice(quoteStart, index + 1)) as string;
    }
  }

  return null;
}

function findNextNonWhitespace(source: string, startIndex: number): number {
  for (let index = startIndex; index < source.length; index += 1) {
    const char = source[index];
    if (char && !isWhitespace(char)) return index;
  }

  return -1;
}

function isWhitespace(value: string): boolean {
  return value === " " || value === "\n" || value === "\r" || value === "\t";
}
