import { ConfigFetchError } from "../../errors";
import { CONFIGURATION_URL, SUPPORTED_MIRROR_TYPES } from "../../settings";
import { attempt, type AttemptOptions } from "../../utilities";
import type { HttpClient } from "../http/http-client";
import type {
  Config,
  Mirror,
  RemoteConfigPayload,
  RemoteMirrorEntry,
  VersionedRemoteConfig,
} from "./types";

export class RemoteConfig {
  private loaded: Config | undefined;

  constructor(
    private readonly http: HttpClient,
    private readonly url: string = CONFIGURATION_URL
  ) {}

  get current(): Config | undefined {
    return this.loaded;
  }

  async load(signal: AbortSignal): Promise<Config> {
    let payload: RemoteConfigPayload;
    try {
      payload = await this.http.json<RemoteConfigPayload>(this.url, { signal });
    } catch {
      throw new ConfigFetchError();
    }
    this.loaded = this.parse(payload);
    return this.loaded;
  }

  async findReachableMirror(
    mirrors: Mirror[],
    onMirrorFail: (failedMirror: string) => void,
    attemptOptions?: AttemptOptions
  ): Promise<Mirror | undefined> {
    for (const mirror of mirrors) {
      const response = await attempt((signal) => {
        return this.http.request(mirror.src, { signal });
      }, attemptOptions);
      if (response) {
        await response.body?.cancel();
        return mirror;
      }
      onMirrorFail(mirror.src);
    }
    return undefined;
  }

  private parse(payload: RemoteConfigPayload): Config {
    let latestVersion = "";
    if (this.hasLatestVersion(payload)) {
      latestVersion = payload.latest_version;
    }
    return {
      latestVersion,
      mirrors: this.parseMirrors(payload.mirrors),
      downloadMirrors: this.parseMirrors(payload.download_mirrors),
    };
  }

  private parseMirrors(entries: RemoteMirrorEntry[] | undefined): Mirror[] {
    if (!Array.isArray(entries)) {
      return [];
    }
    return entries.filter((entry) => {
      return this.isSupportedMirror(entry);
    });
  }

  private isSupportedMirror(entry: RemoteMirrorEntry): entry is Mirror {
    return (
      typeof entry === "object" &&
      entry !== null &&
      typeof entry.src === "string" &&
      URL.canParse(entry.src) &&
      typeof entry.type === "string" &&
      SUPPORTED_MIRROR_TYPES.has(entry.type)
    );
  }

  private hasLatestVersion(payload: RemoteConfigPayload): payload is VersionedRemoteConfig {
    return typeof payload.latest_version === "string";
  }
}
