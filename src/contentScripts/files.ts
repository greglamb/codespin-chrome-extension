import {
  ConnectionInfo,
  FileSystemNode,
  MISSING_KEY,
  Result,
  UNAUTHORIZED,
  UNKNOWN,
} from "../messageTypes.js";
import { resultOrError } from "./resultOrError.js";

export async function getFiles(): Promise<
  Result<
    FileSystemNode,
    typeof MISSING_KEY | typeof UNAUTHORIZED | typeof UNKNOWN
  >
> {
  return await resultOrError((settings: ConnectionInfo) =>
    fetch(`http://localhost:${settings.port}/files`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${settings.key}`,
        "Content-Type": "application/json",
      },
    })
  );
}
