import { LIBGEN_USER_AGENT } from "../../settings";
import { HttpClient } from "./http-client";
import type { HttpRequestOptions } from "./types";

export class LibgenHttpClient extends HttpClient {
  request(url: string, options: HttpRequestOptions): Promise<Response> {
    return fetch(url, {
      method: options.method ?? "GET",
      headers: { "User-Agent": LIBGEN_USER_AGENT, ...options.headers },
      redirect: "follow",
      signal: options.signal,
    });
  }
}
