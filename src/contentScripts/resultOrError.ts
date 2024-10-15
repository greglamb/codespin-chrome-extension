import {
  ConnectionInfo,
  MISSING_KEY,
  Result,
  UNAUTHORIZED,
  UNKNOWN,
} from "../messageTypes.js";
import { getConnectionInfo } from "./connection.js";

export async function resultOrError<T, TError>(
  fetchFunc: (settings: ConnectionInfo) => Promise<Response>
): Promise<
  Result<T, typeof MISSING_KEY | typeof UNKNOWN | typeof UNAUTHORIZED>
> {
  const settings: ConnectionInfo | undefined = await getConnectionInfo();

  if (!settings || !settings.key) {
    return {
      success: false,
      error: MISSING_KEY,
    };
  }

  try {
    const response = await fetchFunc(settings);

    if (response.status === 401) {
      // Return unauthorized error to the caller
      return {
        success: false,
        error: UNAUTHORIZED,
      };
    }

    const data = await response.json();

    if (data.success) {
      return {
        success: true,
        result: data.result,
      };
    } else {
      return {
        success: false,
        error: UNKNOWN,
        message: data.message,
      };
    }
  } catch (error) {
    // Return fetch error to the caller
    return {
      success: false,
      error: UNKNOWN,
      message: (error as Error).message,
    };
  }
}
