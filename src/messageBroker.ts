import { IDisposable } from "./IDisposable.js";

export type EventHandler<TPayload, TResponse> = (
  payload: TPayload
) => Promise<TResponse>;

export type EventHandlerMap = {
  [event: string]: {
    payload: any;
    response: any;
  };
};

type AttachHandlerFunction<TEvents extends EventHandlerMap> = <
  K extends string,
  P,
  R
>(
  event: K,
  handler: EventHandler<P, R>
) => MessageBroker<TEvents & { [key in K]: { payload: P; response: R } }>;

// Structure for the message we receive and send
export interface Message<TPayload> {
  id: string; // Unique ID to match requests and responses
  event: string; // Event type
  payload: TPayload; // Payload to be passed to the handler
}

export interface ResponseMessage<TResponse> {
  id: string; // Same unique ID to respond back to the correct request
  response: TResponse; // Handler's response
}

export interface MessageBroker<TEvents extends EventHandlerMap>
  extends IDisposable {
  attachHandler: AttachHandlerFunction<TEvents>;
  startListening: () => void;
}

export function createMessageBroker<TEvents extends EventHandlerMap = {}>(
  _eventHandlers?: Map<string, EventHandler<any, any>>
): MessageBroker<TEvents> {
  // State to store event handlers
  const eventHandlers: Map<string, EventHandler<any, any>> = _eventHandlers ??
  new Map();

  // The attachHandler function adds event handlers and updates the broker's types
  const attachHandler: AttachHandlerFunction<TEvents> = <
    K extends string,
    P,
    R
  >(
    event: K,
    handler: EventHandler<P, R>
  ) => {
    eventHandlers.set(event, handler);
    // Return a new broker instance with extended types (previous events + new event)
    return createMessageBroker<
      TEvents & { [key in K]: { payload: P; response: R } }
    >(eventHandlers);
  };

  async function messageListener(event: MessageEvent) {
    const { id, event: eventType, payload } = event.data as Message<any>;

    // Check if a handler exists for this event
    const handler = eventHandlers.get(eventType);

    if (handler) {
      try {
        // Call the handler with the unwrapped payload
        const response = await handler(payload);

        // Send the response back, wrapping it in the ResponseMessage structure
        const responseMessage: ResponseMessage<any> = {
          id: id + "-response", // Use the same ID to match the original request
          response,
        };

        window.postMessage(responseMessage, "*");
      } catch (error) {
        console.error(`Error handling event ${eventType}:`, error);
      }
    }
  }

  // Start listening to incoming messages
  const startListening = () => {
    // Add the event listener to listen to incoming postMessage events
    window.addEventListener("message", messageListener);
  };

  const dispose = () => {
    window.removeEventListener("message", messageListener);
  };

  // Return the broker with attachHandler, startListening, and stopListening methods
  return {
    attachHandler,
    startListening,
    dispose,
  };
}
