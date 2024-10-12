import { CODESPIN_SAVE_CONNECTION } from "../messageTypes.js";

export type ConnectionInfo = { host: string; port: string; key: string };

export function getConnectionInfo(): Promise<ConnectionInfo | undefined> {
  return new Promise((resolve) => {
    chrome.storage.local.get(["connection"], function (result) {
      return result.settings
        ? resolve({
            key: result.settings.key,
            host: result.settings.host ?? "localhost",
            port: result.settings.port ?? 60280,
          })
        : resolve(undefined);
    });
  });
}

export async function saveConnectionInfo(data: ConnectionInfo) {
  const { host, port, key } = data;
  chrome.storage.local.set({ connection: { host, port, key } });
}

export function registerEvents(): Array<{
  event: string;
  handler: (data: ConnectionInfo) => void | Promise<void>;
}> {
  return [
    {
      event: CODESPIN_SAVE_CONNECTION,
      handler: saveConnectionInfo,
    },
  ];
}
