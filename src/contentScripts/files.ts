import {
  ConnectionInfo
} from "../messageTypes.js";
import { resultOrError } from "./resultOrError.js";

type ResultOrErrorReturn = Awaited<ReturnType<typeof resultOrError>>;

export async function getFiles(): Promise<ResultOrErrorReturn> {
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
