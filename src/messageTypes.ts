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


// Data Types
export type FileSystemNode =
  | { type: "file"; name: string; length: number }
  | { type: "dir"; name: string; contents: FileSystemNode[] };

export type FileContent = {
  type: "file";
  filename: string;
  path: string;
  contents: string;
  size: number;
};
