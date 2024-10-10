import { parseConnectionInfoFromCookies } from "./cookie.js";

export async function getProjectsClient(): Promise<{
  success: boolean;
  error?: string;
}> {
  return new Promise((resolve) => {
    window.postMessage(
      {
        type: "CODESPIN_GET_PROJECTS",
      },
      "*"
    );

    function handler(event: MessageEvent) {
      if (event.data.type === "CODESPIN_GET_PROJECTS_RESPONSE") {
        window.removeEventListener("message", handler);
        console.log("DATA!", event.data);
        resolve(event.data);
      }
    }

    // Listen for the response
    window.addEventListener("message", handler);
  });
}

async function getProjects(event: MessageEvent) {
  console.log("Connecting to server...");

  const { key, host, port } = parseConnectionInfoFromCookies();

  // Check if all necessary information is present in the cookies
  if (!key || !host || !port) {
    window.postMessage({
      type: "CODESPIN_GET_PROJECTS_RESPONSE",
      success: false,
      error: "INVALID_COOKIE",
    });
  }

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
      console.log(response.json());
      // Return unauthorized error to the caller
      window.postMessage({
        type: "CODESPIN_GET_PROJECTS_RESPONSE",
        success: false,
        error: "Unauthorized access",
      });
    }

    const data = await response.json();

    if (data.success) {
      window.postMessage({
        type: "CODESPIN_GET_PROJECTS_RESPONSE",
        success: true,
      });
    } else {
      // Return server error response
      window.postMessage({
        type: "CODESPIN_GET_PROJECTS_RESPONSE",
        success: false,
        error: data.error || "Unknown error",
      });
    }
  } catch (error) {
    // Return fetch error to the caller
    window.postMessage({
      type: "CODESPIN_GET_PROJECTS_RESPONSE",
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
      event: "CODESPIN_GET_PROJECTS",
      handler: getProjects,
    },
  ];
}
