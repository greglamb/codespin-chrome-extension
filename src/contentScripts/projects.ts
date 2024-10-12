import { ConnectionInfo, getConnectionInfo } from "./connection.js";
import {
  CODESPIN_GET_PROJECTS,
  CODESPIN_GET_PROJECTS_RESPONSE,
  MISSING_KEY,
  UNAUTHORIZED,
} from "../messageTypes.js";

async function getProjects() {
  const settings: ConnectionInfo | undefined = await getConnectionInfo();

  if (!settings || !settings.key) {
    window.postMessage({
      type: CODESPIN_GET_PROJECTS_RESPONSE,
      success: false,
      error: MISSING_KEY,
    });
    return;
  }

  const { key, host, port } = settings;

  const serverUrl = `http://${host}:${port}/projects`; // Build server URL from cookie info

  try {
    const response = await fetch(serverUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
    });

    if (response.status === 401) {
      // Return unauthorized error to the caller
      window.postMessage({
        type: CODESPIN_GET_PROJECTS_RESPONSE,
        success: false,
        error: UNAUTHORIZED,
      });
    }

    const data = await response.json();

    window.postMessage({
      type: CODESPIN_GET_PROJECTS_RESPONSE,
      success: data.success,
      error: data.error,
    });
  } catch (error) {
    // Return fetch error to the caller
    window.postMessage({
      type: CODESPIN_GET_PROJECTS_RESPONSE,
      success: false,
      error: (error as Error).message,
    });
  }
}

export function registerEvents(): Array<{
  event: string;
  handler: (event: MessageEvent) => void | Promise<void>;
}> {
  return [
    {
      event: CODESPIN_GET_PROJECTS,
      handler: getProjects,
    },
  ];
}
