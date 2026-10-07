import type { RecoveryTarget } from "../../../api/availability/types";
import type { Mirror } from "../../../api/data/types";
import type { TCombinedStore } from "../index";

export function uniqueMirrors(mirrors: Mirror[]): Mirror[] {
  return mirrors.filter((mirror, index) => {
    return (
      mirrors.findIndex((candidate) => {
        return candidate.src === mirror.src;
      }) === index
    );
  });
}

export function recoveryMirrors(get: () => TCombinedStore, target: RecoveryTarget): Mirror[] {
  if (target.kind === "download") {
    return get().orderedDownloadMirrors();
  }
  const { mirror, mirrors } = get();
  const candidates = [mirror, ...mirrors].filter((candidate): candidate is Mirror => {
    return candidate !== undefined;
  });
  return uniqueMirrors(candidates);
}
