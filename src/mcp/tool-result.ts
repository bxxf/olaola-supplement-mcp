export interface JsonToolResult {
  [key: string]: unknown;
  content: Array<{
    type: "text";
    text: string;
  }>;
}

export function jsonToolResult(value: unknown): JsonToolResult {
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(value, null, 2),
      },
    ],
  };
}
