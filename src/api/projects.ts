import {
  CODESPIN_GET_PROJECTS,
  Project,
  Result,
  UNKNOWN,
} from "../messageTypes.js";
import { getContentScriptMessageBrokerProxy } from "./broker.js";
import { validateFetch } from "./validateFetch.js";

export async function getProjects(): Promise<
  Result<Project[], typeof UNKNOWN> | undefined
> {
  const broker = getContentScriptMessageBrokerProxy();
  const result = await broker.send(CODESPIN_GET_PROJECTS, {});

  if (result.success) {
    return result;
  } else {
    return validateFetch(result, async (cause) => getProjects());
  }
}
