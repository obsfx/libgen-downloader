import { Box, Text, useInput } from "ink";
import figures from "figures";
import { describeFailureKind } from "../../api/availability/utils/failures";
import { Label } from "../../labels";
import { formatDuration } from "../helpers/display";
import { useNow } from "../hooks/use-now";
import { useBoundStore } from "../store";

export function AvailabilityBanner() {
  const status = useBoundStore((state) => state.availabilityStatus);
  const checkLibgenNow = useBoundStore((state) => state.checkLibgenNow);
  const stopWaitingForLibgen = useBoundStore((state) => state.stopWaitingForLibgen);
  const isWaiting = status.state !== "available";
  const now = useNow(isWaiting);

  useInput(
    (input, key) => {
      if (key.ctrl && input === "r") {
        checkLibgenNow();
        return;
      }
      if (key.escape) {
        stopWaitingForLibgen();
      }
    },
    { isActive: isWaiting }
  );

  if (status.state === "available") {
    return;
  }

  let progress: string = Label.CHECKING_LIBGEN_MIRRORS;
  if (status.state === "waiting") {
    progress = `${Label.NEXT_LIBGEN_CHECK_IN} ${formatDuration(status.nextCheckAt - now)}`;
  }

  return (
    <Box flexDirection="column" borderStyle="round" borderColor="magenta" paddingX={1}>
      <Text wrap="truncate-end">
        <Text color="magentaBright">
          {figures.warning} {describeFailureKind(status.outage.kind)}
        </Text>
        <Text color="gray"> ({status.outage.reason})</Text>
      </Text>
      <Text color="white" wrap="truncate-end">
        {progress}
        <Text color="gray">
          {" "}
          {figures.bullet} {Label.LIBGEN_CHECKS} {status.checks} {figures.bullet}{" "}
          {Label.LIBGEN_WAITING_FOR} {formatDuration(now - status.since)}
        </Text>
        {status.deadline !== undefined && (
          <Text color="gray">
            {" "}
            {figures.bullet} {Label.LIBGEN_GIVES_UP_IN} {formatDuration(status.deadline - now)}
          </Text>
        )}
      </Text>
      <Text color="gray">{Label.LIBGEN_WAIT_CONTROLS}</Text>
    </Box>
  );
}
