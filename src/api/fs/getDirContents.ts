import { FileSystemNode } from "../../messageTypes.js";
import { GitIgnoreHandler } from "./gitIgnore.js";

export async function getDirContents(
  handle: FileSystemHandle,
  gitIgnoreHandler: GitIgnoreHandler,
  path = ""
): Promise<FileSystemNode> {
  try {
    if (handle.kind === "file") {
      const fileHandle = handle as FileSystemFileHandle;
      const file = await fileHandle.getFile();
      return {
        type: "file",
        name: handle.name,
      };
    } else {
      const dirHandle = handle as FileSystemDirectoryHandle;
      const contents: FileSystemNode[] = [];

      try {
        // Process entries one at a time instead of loading all at once
        for await (const [name, entryHandle] of dirHandle.entries()) {
          const entryPath = path ? `${path}/${name}` : name;

          // Check if path should be ignored before processing
          if (await gitIgnoreHandler.shouldIgnorePath(entryPath)) {
            continue;
          }

          // If this is a directory and it contains a .gitignore file, update rules
          if (entryHandle.kind === "directory") {
            await gitIgnoreHandler.updateRulesForDirectory(
              entryHandle,
              entryPath
            );
          }

          contents.push(
            await getDirContents(entryHandle, gitIgnoreHandler, entryPath)
          );
        }
      } catch (error) {
        console.warn(`Failed to read directory contents for ${path}: ${error}`);
      }

      return {
        type: "dir",
        name: handle.name,
        contents,
      };
    }
  } catch (error) {
    throw new Error(`Failed to create file system node: ${error}`);
  }
}
