export type ValidResult<T> = {
  success: true;
  result: T;
};

export type ErrorResult<TError> = {
  success: false;
  error: TError;
  message?: string;
};
export type Result<T, TError = string> = ValidResult<T> | ErrorResult<TError>;

// Message types
export const CODESPIN_SAVE_CONNECTION = "CODESPIN_SAVE_CONNECTION";
export const CODESPIN_GET_FILES = "CODESPIN_GET_FILES";

// Error codes
export const UNAUTHORIZED = "UNAUTHORIZED";
export const MISSING_KEY = "MISSING_KEY";
export const UNKNOWN = "UNKNOWN";
export const FAILED_TO_CONNECT = "FAILED_TO_CONNECT";

// Data Types
export type FileSystemNode =
  | { type: "file"; name: string; length: number }
  | { type: "dir"; name: string; contents: FileSystemNode[] };

export type ConnectionInfo = { port: string; key: string };
