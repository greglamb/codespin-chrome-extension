import { ContentScriptMessageBrokerEvents } from "../contentScripts/broker.js";
import { createMessageBrokerClient } from "../messageBrokerClient.js";

export function getMessageBrokerClient() {
  return createMessageBrokerClient<ContentScriptMessageBrokerEvents>();
}
