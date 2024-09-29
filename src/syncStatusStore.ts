type ConnectionState = "connected" | "disconnected";
type Listener = (state: ConnectionState) => void;

let connectionState: ConnectionState = "disconnected";
const listeners: Listener[] = [];

/**
 * Sets the connection state and notifies all subscribed listeners.
 * @param state - The new connection state ("connected" or "disconnected").
 */
export function setConnectionState(state: ConnectionState) {
  connectionState = state;
  notifyListeners();
}

/**
 * Gets the current connection state.
 * @returns The current connection state ("connected" or "disconnected").
 */
export function getConnectionState(): ConnectionState {
  return connectionState;
}

/**
 * Subscribes a listener to be notified whenever the connection state changes.
 * @param listener - The listener function to be called when the state changes.
 */
export function subscribe(listener: Listener) {
  listeners.push(listener);
}

/**
 * Unsubscribes a listener from the connection state updates.
 * @param listener - The listener function to be removed.
 */
export function unsubscribe(listener: Listener) {
  const index = listeners.indexOf(listener);
  if (index !== -1) {
    listeners.splice(index, 1);
  }
}

/**
 * Notifies all subscribed listeners of the current connection state.
 */
function notifyListeners() {
  listeners.forEach((listener) => listener(connectionState));
}
