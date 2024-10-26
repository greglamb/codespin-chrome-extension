import {
  ConnectionInfo,
  FileContent,
  FileSystemNode,
} from "../messageTypes.js";
import { resultOrError } from "./resultOrError.js";

type ResultOrErrorReturn = Awaited<ReturnType<typeof resultOrError>>;

export async function getFiles() {
  return await resultOrError<FileSystemNode>((settings: ConnectionInfo) =>
    fetch(`http://localhost:${settings.port}/files`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${settings.key}`,
        "Content-Type": "application/json",
      },
    })
  );
}

export async function getFileContent(data: { path: string }) {
  return await resultOrError<FileContent>((settings: ConnectionInfo) =>
    fetch(
      `http://localhost:${settings.port}/file-content/${encodeURIComponent(
        data.path
      )}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${settings.key}`,
          "Content-Type": "application/json",
        },
      }
    )
  );
}
