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
    // Updated to check for both read and write permissions
    const permissionStatus = await handle.queryPermission({ mode: "readwrite" });
    if (permissionStatus === "granted") {
      const entriesIterator = handle.entries();
      await entriesIterator.next();
      return true;
    }
    
    // If not granted, try to request permission
    const requestStatus = await handle.requestPermission({ mode: "readwrite" });
    return requestStatus === "granted";
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
    // Updated to request directory with read/write access
    const dirHandle = await window.showDirectoryPicker({
      mode: "readwrite"
    });
    
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