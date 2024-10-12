import { createMessageBroker } from "../messageBroker.js";
import { getProjects } from "./projects.js";

const contentScriptMessageBroker = createMessageBroker().attachHandler(
  "CODESPIN_GET_PROJECTS",
  getProjects
);

export type ContentScriptMessageBrokerType = typeof contentScriptMessageBroker;
