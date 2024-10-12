import "./contentScripts/broker.js";

const script = document.createElement("script");
script.type = "module";
script.src = chrome.runtime.getURL("/dist/main.js");
document.body.appendChild(script);
