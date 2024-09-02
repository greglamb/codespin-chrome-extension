export async function writeFile(
  projectSyncUrl: string,
  message: {
    type: string;
    filePath: string;
    contents: string;
  }
): Promise<void> {
  const url = `${projectSyncUrl}/write`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: message.type,
        filePath: message.filePath,
        contents: message.contents,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to send code to IDE: ${response.statusText}`);
    }

    const responseData = await response.json();
  } catch (error) {
    console.error(error);
  }
}
