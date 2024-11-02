import { FileSystemNode } from "../../messageTypes.js";
import { GitIgnoreHandler } from "./GitIgnoreHandler.js";

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

      // Create new handler for this directory if it has a .gitignore
      const dirHandler = await gitIgnoreHandler.createChildHandler(
        dirHandle,
        path
      );

      // Process directory contents
      for await (const [name, entryHandle] of dirHandle.entries()) {
        const entryPath = path ? `${path}/${name}` : name;

        if (await dirHandler.shouldIgnorePath(entryPath)) {
          continue;
        }

        // Pass the current directory's handler to child directories
        contents.push(await getDirContents(entryHandle, dirHandler, entryPath));
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
