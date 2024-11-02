import {
  FileContent,
  FileSystemNode,
  ValidResult,
} from "../../messageTypes.js";
import { getDirContents } from "./getDirContents.js";
import {
  getDirectoryHandle,
  getRootDirectoryName,
} from "./getDirectoryHandle.js";
import { GitIgnoreHandler } from "./gitIgnore.js";

export async function getFiles(): Promise<ValidResult<FileSystemNode>> {
  try {
    const dirHandle = await getDirectoryHandle();
    const gitIgnoreHandler = new GitIgnoreHandler();
    const rootNode = await getDirContents(dirHandle, gitIgnoreHandler);

    return {
      success: true,
      result: rootNode,
    };
  } catch (error: any) {
    throw error;
  }
}

export async function getFileContent(
  path: string
): Promise<ValidResult<FileContent>> {
  try {
    const rootDirectoryName = getRootDirectoryName();
    const dirHandle = await getDirectoryHandle();

    // Remove root directory name from path if it exists
    const normalizedPath = path.startsWith(rootDirectoryName + "/")
      ? path.slice(rootDirectoryName.length + 1)
      : path.slice(rootDirectoryName.length);

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
          path: normalizedPath,
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

export async function writeFileContent(
  path: string,
  content: string
): Promise<ValidResult<void>> {
  try {
    const dirHandle = await getDirectoryHandle();

    // Handle paths starting with "./" or "."
    const normalizedPath = path.startsWith("./") ? path.slice(2) : path;

    const pathParts = normalizedPath.split("/").filter((p) => p.length > 0);

    // Handle the case where we're writing to the root directory
    if (pathParts.length === 0) {
      throw new Error("Cannot write to directory path");
    }

    let currentHandle: FileSystemDirectoryHandle = dirHandle;

    // Navigate through directories, creating them if they don't exist
    for (const part of pathParts.slice(0, -1)) {
      try {
        currentHandle = await currentHandle.getDirectoryHandle(part, {
          create: true,
        });
      } catch (error) {
        throw new Error(`Failed to access or create directory: ${part}`);
      }
    }

    const fileName = pathParts[pathParts.length - 1];
    try {
      // Get or create the file handle
      const fileHandle = await currentHandle.getFileHandle(fileName, {
        create: true,
      });

      // Create a writable stream and write the content
      const writable = await fileHandle.createWritable();
      await writable.write(content);
      await writable.close();

      return {
        success: true,
        result: undefined,
      };
    } catch (error: any) {
      throw new Error(`Failed to write file ${fileName}: ${error.message}`);
    }
  } catch (error: any) {
    throw error;
  }
}
