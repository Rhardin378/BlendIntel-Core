export function parseBoldMarkdown(text: string) {
  return text.split(/(\*\*.*?\*\*)/).map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return {
        type: "bold" as const,
        content: part.slice(2, -2),
        key: i,
      };
    }
    return {
      type: "text" as const,
      content: part,
      key: i,
    };
  });
}

export function splitParagraphs(text: string) {
  return text.split("\n\n").filter((p) => p.trim());
}

export function isNumberedList(paragraph: string) {
  return /^\d+\./.test(paragraph.trim());
}
