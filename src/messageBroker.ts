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
  attachHandler: AttachHandlerFunction<TEvents>;
}

// Create the message broker factory function
export function createMessageBroker<
  TEvents extends EventHandlerMap = {}
>(): MessageBroker<TEvents> {
  // State to store event handlers
  const eventHandlers: Map<string, EventHandler<any, any>> = new Map();

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
    attachHandler,
  };
}
