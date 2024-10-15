import { createMessageBroker, MessageBroker } from "../messageBroker.js";
import { CODESPIN_GET_FILES, CODESPIN_SAVE_CONNECTION } from "../messageTypes.js";
import { saveConnectionInfo } from "./connection.js";
import { getFiles } from "./files.js";

export function getBroker() {
  const broker = createMessageBroker()
    .attachHandler(CODESPIN_GET_FILES, getFiles)
    .attachHandler(CODESPIN_SAVE_CONNECTION, saveConnectionInfo);

  broker.startListening();
  return broker;
}

export type ContentScriptMessageBrokerEvents = ReturnType<
  typeof getBroker
> extends MessageBroker<infer TEvents>
  ? TEvents
  : never;
