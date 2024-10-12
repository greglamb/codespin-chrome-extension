export type Result<T, TError = string> =
  | {
      success: true;
      result: T;
    }
  | { success: false; error: TError; message?: string };

// Message types
export const CODESPIN_SAVE_CONNECTION = "CODESPIN_SAVE_CONNECTION";
export const CODESPIN_GET_PROJECTS = "CODESPIN_GET_PROJECTS";

// Error codes
export const UNAUTHORIZED = "UNAUTHORIZED";
export const MISSING_KEY = "MISSING_KEY";
export const UNKNOWN = "UNKNOWN";

// Data Types
export type Project = {
  path: string;
};

export type ConnectionInfo = { host: string; port: string; key: string };
