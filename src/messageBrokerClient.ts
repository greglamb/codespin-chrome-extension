// EventHandler type definition
type EventHandler<TPayload, TResponse> = (
  payload: TPayload
) => Promise<TResponse>;

// EventHandlerMap - dynamically accumulates the event handlers
type EventHandlerMap = {
  [event: string]: {
    payload: any;
    response: any;
  };
};

// Send function definition
type SendFunction<TEvents extends EventHandlerMap> = <K extends keyof TEvents>(
  event: K,
  payload: TEvents[K]["payload"]
) => Promise<TEvents[K]["response"]>;

// AttachHandler function definition
type AttachHandlerFunction<TEvents extends EventHandlerMap> = <
  K extends string,
  P,
  R
>(
  event: K,
  handler: EventHandler<P, R>
) => MessageBroker<TEvents & { [key in K]: { payload: P; response: R } }>;

// MessageBroker interface definition
export interface MessageBroker<TEvents extends EventHandlerMap> {
  send: SendFunction<TEvents>;
  attachHandler: AttachHandlerFunction<TEvents>;
}

// Create the message broker factory function
export function createMessageBroker<
  TEvents extends EventHandlerMap = {}
>(): MessageBroker<TEvents> {
  // State to store event handlers
  const eventHandlers: Map<string, EventHandler<any, any>> = new Map();

  // The send function ensures correct payload/response types based on the events
  const send: SendFunction<TEvents> = <K extends keyof TEvents>(
    eventName: K,
    payload: TEvents[K]["payload"]
  ) => {
    return new Promise((resolve, reject) => {
      const handler = eventHandlers.get(eventName as string);
      if (handler) {
        handler(payload).then(resolve).catch(reject);
      } else {
        reject(
          new Error(`No handler registered for event: ${eventName as string}`)
        );
      }
    });
  };

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
    >();
  };

  // Return the initial broker with no handlers attached
  return {
    send,
    attachHandler,
  };
}
