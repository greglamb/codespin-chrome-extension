import { withDisposable } from "../IDisposable.js";
import {
  CODESPIN_GET_FILE_CONTENT,
  CODESPIN_GET_FILES,
} from "../messageTypes.js";
import { getMessageBrokerClient } from "./broker.js";
import { validateConnection } from "./validateConnection.js";

type BrokerClient = ReturnType<typeof getMessageBrokerClient>;
type SendResult = Awaited<ReturnType<BrokerClient["send"]>>;

export async function getFiles(): Promise<SendResult | void> {
  return await withDisposable(getMessageBrokerClient, async (broker) => {
    const result = await broker.send(CODESPIN_GET_FILES, {});

    if (result.success) {
      return result;
    } else {
      return await validateConnection(result, (cause) => getFiles());
    }
  });
}

export async function getFileContent(path: string): Promise<any> {
  return await withDisposable(getMessageBrokerClient, async (broker) => {
    const result = await broker.send(CODESPIN_GET_FILE_CONTENT, { path });

    if (result.success) {
      return result;
    } else {
      return await validateConnection(result, () => getFileContent(path));
    }
  });
}
