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
  const url = `${serverUrl}/auth`;
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.error || response.statusText);
    }

    return responseData;
  } catch (error: any) {
    return { success: false, error: error.message || "Unable to connect" };
  }
}
