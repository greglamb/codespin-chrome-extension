async function sendCodeToIDE(message: {
  type: string;
  projectPath: string;
  filePath: string;
  contents: string;
}): Promise<void> {
  const url = "http://localhost:60280/send-to-ide"; // Hardcoded URL

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      throw new Error(`Failed to send code to IDE: ${response.statusText}`);
    }

    const responseData = await response.json();
  } catch (error) {}
}

export { sendCodeToIDE };
