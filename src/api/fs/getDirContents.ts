import { FileSystemNode } from "../../messageTypes.js";
import { getFileContent } from "./files.js";
import { filterIgnoredPaths } from "./gitIgnore.js";

export async function getDirContents(
  handle: FileSystemHandle,
  path = ""
): Promise<FileSystemNode> {
  try {
    if (handle.kind === "file") {
      const fileHandle = handle as FileSystemFileHandle;
      const file = await fileHandle.getFile();
      return {
        type: "file",
        name: handle.name,
        length: file.size,
      };
    } else {
      const dirHandle = handle as FileSystemDirectoryHandle;
      const contents: FileSystemNode[] = [];

      const readFile = async (path: string): Promise<string | undefined> => {
        try {
          const result = await getFileContent(path);
          if (result.success) {
            return result.result.contents;
          }
          return undefined;
        } catch (error) {
          return undefined;
        }
      };

      try {
        const entries = await Array.fromAsync(dirHandle.entries());
        const filtered = await filterIgnoredPaths(entries, readFile);

        for await (const [name, handle] of filtered) {
          const entryPath = path ? `${path}/${name}` : name;
          contents.push(await getDirContents(handle, entryPath));
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
