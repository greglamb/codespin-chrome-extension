import { ConnectionInfo } from "../messageTypes.js";

export function getConnectionInfo(): Promise<ConnectionInfo | undefined> {
  return new Promise((resolve) => {
    chrome.storage.local.get(["connection"], function (result) {
      return result.connection
        ? resolve({
            key: result.connection.key,
            host: result.connection.host || "localhost",
            port: result.connection.port || 60280,
          })
        : resolve(undefined);
    });
  });
}

export async function saveConnectionInfo(data: ConnectionInfo) {
  const { host, port, key } = data;
  chrome.storage.local.set({ connection: { host, port, key } });
}
