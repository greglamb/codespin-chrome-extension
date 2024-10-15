import { withDisposable } from "../IDisposable.js";
import { CODESPIN_GET_FILES, FileSystemNode, Result } from "../messageTypes.js";
import { getMessageBrokerClient } from "./broker.js";
import { validateConnection } from "./validateConnection.js";

export async function getFiles(): Promise<Result<
  FileSystemNode,
  "MISSING_KEY" | "UNAUTHORIZED" | "UNKNOWN"
> | void> {
  return await withDisposable(getMessageBrokerClient, async (broker) => {
    const result = await broker.send(CODESPIN_GET_FILES, {});

    if (result.success) {
      return result;
    } else {
      return await validateConnection(result, (cause) => getFiles());
    }
  });
}
