import { LIBGEN_USER_AGENT } from "../../settings";

export function fetchLibgen(input: RequestInfo | URL, signal: AbortSignal): Promise<Response> {
  return fetch(input, {
    headers: {
      "User-Agent": LIBGEN_USER_AGENT,
    },
    signal,
  });
}
