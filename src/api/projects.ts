import { CODESPIN_GET_PROJECTS, CODESPIN_GET_PROJECTS_RESPONSE } from "../messageTypes.js";

export async function getProjects(): Promise<{
  success: boolean;
  error?: string;
}> {
  return new Promise((resolve) => {
    window.postMessage(
      {
        type: CODESPIN_GET_PROJECTS,
      },
      "*"
    );

    function handler(event: MessageEvent) {
      if (event.data.type === CODESPIN_GET_PROJECTS_RESPONSE) {
        window.removeEventListener("message", handler);
        resolve(event.data);
      }
    }

    // Listen for the response
    window.addEventListener("message", handler);
  });
}
