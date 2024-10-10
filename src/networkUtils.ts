export async function checkSyncUrl(url: string): Promise<boolean> {
  if (!url) {
    return false;
  }
  try {
    const response = await fetch(url, { method: "GET" });
    return response.ok;
  } catch (error) {
    console.error("Error checking sync URL:", error);
    return false;
  }
}

export async function connectToServer(
  token: string,
  serverUrl: string
): Promise<{ success: boolean; error?: string }> {
  return new Promise((resolve, reject) => {
    window.postMessage(
      {
        action: "connectToServer",
        data: { token, serverUrl },
      },
      "*"
    );

    // Listen for the response
    window.addEventListener("message", function handleResponse(event) {
      if (event.data && event.data.action === "serverResponse") {
        window.removeEventListener("message", handleResponse);

        const response = event.data.response;
        if (response.success) {
          resolve(response);
        } else {
          reject({ success: false, error: response.error || "Unknown error" });
        }
      }
    });
  });
}
