declare function sendCodeToIDE(message: {
    type: string;
    projectPath: string;
    filePath: string;
    contents: string;
}): Promise<void>;
export { sendCodeToIDE };
