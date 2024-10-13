import * as webjsx from "webjsx";
import {
  ConnectionInfo,
  MISSING_KEY,
  Result,
  UNAUTHORIZED,
} from "../messageTypes.js";
import { Connection } from "../chatGPT/components/Connection.js";

export async function validateConnection<T>(
  result: Result<string>,
  whenFetchError: (
    cause: typeof MISSING_KEY | typeof UNAUTHORIZED
  ) => Promise<T>
): Promise<T | undefined> {
  if (
    !result.success &&
    (result.error === MISSING_KEY || result.error === UNAUTHORIZED)
  ) {
    const connectionInfo = await new Promise<ConnectionInfo | undefined>(
      (resolve) => {
        const connectionForm = webjsx.createNode(
          <codespin-connection resolve={resolve} />
        ) as Connection;
        document.body.appendChild(connectionForm);
      }
    );

    if (connectionInfo) {
      return await whenFetchError(result.error);
    }
  }
}
