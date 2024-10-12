import {
  ConnectionInfo,
  Project,
  Result,
  MISSING_KEY,
  UNAUTHORIZED,
  UNKNOWN,
} from "../messageTypes.js";
import { getConnectionInfo } from "./connection.js";

export async function getProjects(): Promise<
  Result<Project[], typeof MISSING_KEY | typeof UNAUTHORIZED | typeof UNKNOWN>
> {
  const settings: ConnectionInfo | undefined = await getConnectionInfo();

  if (!settings || !settings.key) {
    return {
      success: false,
      error: MISSING_KEY,
    };
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
      return {
        success: false,
        error: UNAUTHORIZED,
      };
    }

    const data = await response.json();

    if (data.success) {
      return {
        success: true,
        result: data.result,
      };
    } else {
      return {
        success: false,
        error: UNKNOWN,
        message: data.message,
      };
    }
  } catch (error) {
    // Return fetch error to the caller
    return {
      success: false,
      error: UNKNOWN,
      message: (error as Error).message,
    };
  }
}
