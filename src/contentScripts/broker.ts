import { createMessageBroker, MessageBroker } from "../messageBroker.js";
import { getProjects } from "./projects.js";

export function getBroker() {
  const broker = createMessageBroker().attachHandler(
    "CODESPIN_GET_PROJECTS",
    getProjects
  );

  broker.startListening();
  return broker;
}

export type ContentScriptMessageBrokerEvents = ReturnType<
  typeof getBroker
> extends MessageBroker<infer TEvents>
  ? TEvents
  : never;
