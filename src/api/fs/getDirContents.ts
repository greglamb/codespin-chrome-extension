import { FileSystemNode } from "../../messageTypes.js";
import { GitIgnoreHandler } from "./GitIgnoreHandler.js";

export async function getDirContents(
  handle: FileSystemHandle,
  gitIgnoreHandler: GitIgnoreHandler | null,
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
      
      // Create new handler for this directory if we're processing gitignore files
      const dirHandler = gitIgnoreHandler 
        ? await gitIgnoreHandler.createChildHandler(dirHandle, path)
        : null;

      // Process directory contents
      for await (const [name, entryHandle] of dirHandle.entries()) {
        const entryPath = path ? `${path}/${name}` : name;
        
        // Skip if path should be ignored and we're processing gitignore
        if (dirHandler && await dirHandler.shouldIgnorePath(entryPath)) {
          continue;
        }
        
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