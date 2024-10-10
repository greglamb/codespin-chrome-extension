import {
  registerEvents
} from "./api/projects.js";

const script = document.createElement("script");
script.type = "module";
script.src = chrome.runtime.getURL("/dist/main.js");
document.body.appendChild(script);

const eventsMap: {
  [key: string]: (event: MessageEvent) => void | Promise<void>;
} = {};

[registerEvents].forEach((registrationFunctions) => {
  const registrations = registrationFunctions();
  registrations.forEach((registration) => {
    eventsMap[registration.event] = registration.handler;
  });
});

window.addEventListener("message", async function (event: MessageEvent) {
  if (eventsMap[event.data.type]) {
    eventsMap[event.data.type](event);
  }
});
