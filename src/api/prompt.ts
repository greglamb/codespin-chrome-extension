import { exception } from "../exception.js";
import { getFileContent } from "./fs/files.js";
import { trimWhitespace } from "./templating.js";

async function getDefaultConvention(): Promise<string | null> {
  try {
    const conventionFile = await getFileContent(
      "./.codespin/conventions/default.md"
    );
    return conventionFile.success ? conventionFile.result.contents : null;
  } catch {
    return null;
  }
}

function createFilesSection(filesContent: string): string {
  return (
    trimWhitespace(`
    File contents below:
    ======================
  `) +
    "\n" +
    filesContent +
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
    Note that you must always output the entire file whenever you're changing something.
  `) +
    "\n\n"
  );
}

export async function fromFileSelection(selectedFiles: string[]) {
  const filesContent = (
    await Promise.all(
      selectedFiles.map(async (filePath) => {
        const fileContentsResponse = await getFileContent(filePath);
        return fileContentsResponse.success
          ? `File path: ./${fileContentsResponse.result.path}\n\`\`\`\n${fileContentsResponse.result.contents}\`\`\`\n`
          : exception(`Failed to fetch ${filePath}`);
      })
    )
  ).join("\n");

  const convention = await getDefaultConvention();
  if (!convention) {
    return createFilesSection(filesContent);
  }

  const defaultPrompt = createFilesSection(filesContent);

  if (convention.includes("{prompt}")) {
    return convention.replace("{prompt}", defaultPrompt);
  }

  if (convention.includes("{files}")) {
    return convention.replace("{files}", filesContent);
  }

  return defaultPrompt;
}
