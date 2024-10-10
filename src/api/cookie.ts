import { getCookie } from "../cookieUtils.js";

// Function to parse and extract relevant information from separate cookies
export function parseConnectionInfoFromCookies(): {
  key: string | null;
  host: string | null;
  port: string | null;
} {
  const key = getCookie("key");
  const host = getCookie("host");
  const port = getCookie("port");

  return { key, host, port };
}
