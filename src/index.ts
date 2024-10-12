import { registerEvents as projectRegisterEvents } from "./contentScripts/projects.js";
import { registerEvents as connectionRegisterEvents } from "./contentScripts/connection.js";

const script = document.createElement("script");
script.type = "module";
script.src = chrome.runtime.getURL("/dist/main.js");
document.body.appendChild(script);

const eventsMap: {
  [key: string]: (data: any) => void | Promise<void>;
} = {};

[projectRegisterEvents, connectionRegisterEvents].forEach(
  (registrationFunctions) => {
    const registrations = registrationFunctions();
    registrations.forEach((registration) => {
      eventsMap[registration.event] = registration.handler;
    });
  }
);

window.addEventListener("message", async function (event: MessageEvent) {
  if (eventsMap[event.data.type]) {
    eventsMap[event.data.type](event.data.data);
  }
});
