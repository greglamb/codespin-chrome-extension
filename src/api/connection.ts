import { withDisposable } from "../IDisposable.js";
import { CODESPIN_SAVE_CONNECTION, ConnectionInfo } from "../messageTypes.js";
import { getMessageBrokerClient } from "./broker.js";

export async function saveConnection(
  connection: ConnectionInfo
): Promise<ConnectionInfo> {
  return await withDisposable(getMessageBrokerClient, async (broker) => {
    await broker.send(CODESPIN_SAVE_CONNECTION, connection);
    return connection;
  });
}
