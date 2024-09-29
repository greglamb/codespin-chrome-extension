/**
 * Extracts the file path from the content of a sibling element preceding the provided element.
 * The function searches for a specific pattern: "File path: {path}" in the sibling elements.
 *
 * @param element - The DOM element whose preceding sibling contains the file path information.
 * @returns The extracted file path as a string or null if no file path is found.
 */
export function extractFilePath(element: HTMLElement): string | null {
  let sibling = element.previousElementSibling as HTMLElement | null;

  while (sibling) {
    const textContent = sibling.textContent || "";
    const filePathMatch = textContent.match(
      /File path:\s*["'`]?(.+?)["'`]?(\n|$)/
    );

    if (filePathMatch) {
      return filePathMatch[1].trim();
    }

    sibling = sibling.previousElementSibling as HTMLElement | null;
  }

  return null;
}
