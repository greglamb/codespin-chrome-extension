export async function pasteText(element: Element, text: string) {
  try {
    // Create a new text node with the clipboard content
    const textNode = document.createTextNode(text);

    // Get current selection
    const selection = window.getSelection()!;
    let range;

    // If there's no existing range, create one at the end of the element
    if (selection.rangeCount === 0) {
      range = document.createRange();
      range.selectNodeContents(element);
      range.collapse(false); // collapse to end
      selection.removeAllRanges();
      selection.addRange(range);
    } else {
      range = selection.getRangeAt(0);
    }

    // Delete any selected content and insert new text
    range.deleteContents();
    range.insertNode(textNode);

    // Move cursor to end of inserted text
    range.setStartAfter(textNode);
    range.setEndAfter(textNode);
    selection.removeAllRanges();
    selection.addRange(range);
  } catch (err) {
    console.error("Failed to paste:", err);
  }
}

export function insertHTML(element: Element, text: string) {
  const lines = text.split("\n");

  // Create and append a p element for each line
  lines.forEach((line) => {
    if (line.trim()) {
      // Only create elements for non-empty lines
      const p = document.createElement("p");
      p.textContent = line;
      element.appendChild(p);
    } else {
      const br = document.createElement("br");
      element.appendChild(br);
    }
  });
}
