import { ContentScriptMessageBrokerType } from "../contentScripts/broker.js";
import { createMessageBroker } from "../messageBroker.js";

export function getContentScriptMessageBrokerProxy(): ContentScriptMessageBrokerType {
  return createMessageBroker<any>() as any;
}
