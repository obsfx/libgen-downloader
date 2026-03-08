import { Box, Text } from "ink";
import { useBoundStore } from "../store/index";
import Label from "../../labels";
import Spinner from "./spinner";

const MirrorFailover = () => {
  const mirrorCheckStates = useBoundStore((state) => state.mirrorCheckStates);

  if (mirrorCheckStates.length === 0) {
    return;
  }

  return (
    <Box flexDirection="column" marginTop={1}>
      <Text color="yellow">{Label.TRYING_OTHER_MIRRORS}</Text>
      {mirrorCheckStates.map((mirror) => (
        <Box key={mirror.src}>
          <Text color="gray">  </Text>
          {mirror.status === "checking" && (
            <Text color="yellow">
              <Spinner />
            </Text>
          )}
          {mirror.status === "ok" && <Text color="green">✓</Text>}
          {mirror.status === "failed" && <Text color="red">✗</Text>}
          {mirror.status === "pending" && <Text color="gray">·</Text>}
          <Text color="gray"> {mirror.src}</Text>
        </Box>
      ))}
    </Box>
  );
};

export default MirrorFailover;
