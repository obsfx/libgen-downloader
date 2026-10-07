export type MirrorType = "libgen-plus" | "libgen-spa";

export interface Mirror {
  src: string;
  type: MirrorType;
}

export interface Config {
  latestVersion: string;
  mirrors: Mirror[];
  downloadMirrors: Mirror[];
}

export interface RemoteMirrorEntry {
  src?: string;
  type?: string;
}

export interface RemoteConfigPayload {
  latest_version?: string;
  mirrors?: RemoteMirrorEntry[];
  download_mirrors?: RemoteMirrorEntry[];
}

export interface VersionedRemoteConfig extends RemoteConfigPayload {
  latest_version: string;
}
