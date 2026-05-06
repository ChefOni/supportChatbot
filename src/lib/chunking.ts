export function splitContentIntoChunks(
  content: string,
  chunkSize: number = 500,
  overlap: number = 50
): string[] {
  const chunks: string[] = [];
  let startIndex = 0;

  while (startIndex < content.length) {
    const endIndex = Math.min(startIndex + chunkSize, content.length);
    chunks.push(content.substring(startIndex, endIndex));
    startIndex += chunkSize - overlap;
  }

  return chunks.filter((chunk) => chunk.trim().length > 0);
}
