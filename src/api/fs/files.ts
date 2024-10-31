import {
  FileContent,
  FileSystemNode,
  ValidResult,
} from "../../messageTypes.js";
import { getDirContents } from "./getDirContents.js";
import { getDirectoryHandle, getRootDirectoryName } from "./getDirectoryHandle.js";

export async function getFiles(): Promise<ValidResult<FileSystemNode>> {
  try {
    const dirHandle = await getDirectoryHandle();
    const rootNode = await getDirContents(dirHandle);

    return {
      success: true,
      result: rootNode,
    };
  } catch (error: any) {
    throw error;
  }
}

export async function getFileContent(
  path: string,
): Promise<ValidResult<FileContent>> {
  try {
    const rootDirectoryName = getRootDirectoryName();
    const dirHandle = await getDirectoryHandle();

    // Remove root directory name from path if it exists
    let normalizedPath = path;
    if (path.startsWith(rootDirectoryName + "/")) {
      normalizedPath = path.slice(rootDirectoryName.length + 1);
    } else if (path.startsWith(rootDirectoryName)) {
      normalizedPath = path.slice(rootDirectoryName.length);
    }

    const pathParts = normalizedPath.split("/").filter((p) => p.length > 0);

    let currentHandle: FileSystemHandle = dirHandle;

    // Navigate through the path with error handling
    for (const part of pathParts.slice(0, -1)) {
      if (currentHandle.kind === "directory") {
        try {
          currentHandle = await (
            currentHandle as FileSystemDirectoryHandle
          ).getDirectoryHandle(part);
        } catch (error) {
          throw new Error(`Directory not found: ${part}`);
        }
      } else {
        throw new Error(
          `Invalid path: ${path} - trying to traverse through a file`
        );
      }
    }

    if (currentHandle.kind !== "directory") {
      throw new Error(`Invalid path: ${path} - parent must be a directory`);
    }

    const fileName = pathParts[pathParts.length - 1];
    try {
      const fileHandle = await (
        currentHandle as FileSystemDirectoryHandle
      ).getFileHandle(fileName);
      const file = await fileHandle.getFile();
      const contents = await file.text();

      return {
        success: true,
        result: {
          type: "file",
          filename: file.name,
          path: path,
          contents: contents,
          size: file.size,
        },
      };
    } catch (error) {
      throw new Error(`File not found: ${fileName}`);
    }
  } catch (error: any) {
    throw error;
  }
}
