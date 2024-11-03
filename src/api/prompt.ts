import { exception } from "../exception.js";
import { getFileContent } from "./fs/files.js";
import { trimWhitespace } from "./templating.js";

export async function createPromptFromFileSelection(selectedFiles: string[]) {
  const prompt =
    trimWhitespace(`
      File contents below:
      ======================
    `) +
    "\n" +
    (
      await Promise.all(
        selectedFiles.map(async (filePath) => {
          const fileContentsResponse = await getFileContent(filePath);
          return fileContentsResponse.success
            ? `File path: ./${fileContentsResponse.result.path}\n\`\`\`\n${fileContentsResponse.result.contents}\`\`\`\n`
            : exception(`Failed to fetch ${filePath}`);
        })
      )
    ).join("\n") +
    trimWhitespace(`
      ======================
      End of file contents

      All the code you output in this conversation should be formatted in the following way:

      File path: ./path/to/file1.ts
      \`\`\`ts
      file1.ts contents go here...
      \`\`\`

      File path: ./path/to/file2.py
      \`\`\`py
      file2.py contents go here...
      \`\`\`

      Note that you must always output the entire file whenever you're changing something.`) +
    "\n\n";
  return prompt;
}
