let cachedDirectoryHandle: FileSystemDirectoryHandle | null = null;
let rootDirectoryName: string = "";

function isFileSystemApiSupported(): boolean {
  return "showDirectoryPicker" in window;
}

export function getRootDirectoryName() {
  return rootDirectoryName;
}

async function verifyDirectoryHandle(
  handle: FileSystemDirectoryHandle
): Promise<boolean> {
  try {
    const permissionStatus = await handle.queryPermission({ mode: "read" });
    if (permissionStatus === "granted") {
      const entriesIterator = handle.entries();
      await entriesIterator.next();
      return true;
    }
    return false;
  } catch (error) {
    return false;
  }
}

export async function getDirectoryHandle(): Promise<FileSystemDirectoryHandle> {
  if (!isFileSystemApiSupported()) {
    throw new Error("File System API is not supported in this browser");
  }

  if (cachedDirectoryHandle) {
    const isValid = await verifyDirectoryHandle(cachedDirectoryHandle);
    if (isValid) {
      return cachedDirectoryHandle;
    }
    cachedDirectoryHandle = null;
    rootDirectoryName = "";
  }

  try {
    const dirHandle = await window.showDirectoryPicker();
    const isValid = await verifyDirectoryHandle(dirHandle);

    if (!isValid) {
      throw new Error("Failed to verify directory access");
    }

    cachedDirectoryHandle = dirHandle;
    rootDirectoryName = dirHandle.name;
    return dirHandle;
  } catch (error: any) {
    throw new Error(`Failed to access file system: ${error.message}`);
  }
}

export async function initializeFileSystem(): Promise<void> {
  if (cachedDirectoryHandle) {
    const isValid = await verifyDirectoryHandle(cachedDirectoryHandle);
    if (!isValid) {
      cachedDirectoryHandle = null;
      rootDirectoryName = "";
    } else {
      return;
    }
  }
  await getDirectoryHandle();
}

export function clearFileSystemCache(): void {
  cachedDirectoryHandle = null;
  rootDirectoryName = "";
}

export function isFileSystemInitialized(): boolean {
  return cachedDirectoryHandle !== null;
}
