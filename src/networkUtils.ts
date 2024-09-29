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
