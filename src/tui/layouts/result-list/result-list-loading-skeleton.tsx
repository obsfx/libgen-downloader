import { Box, Text } from "ink";
import InkSpinner from "ink-spinner";
import Label from "../../../labels";
import { RESULT_LIST_LENGTH } from "../../../constants";
import { useBoundStore } from "../../store/index";
import MirrorFailover from "../../components/mirror-failover";

export function ResultListLoadingSkeleton() {
  const connectionError = useBoundStore((state) => state.connectionError);

  return (
    <Box
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight={RESULT_LIST_LENGTH + 2}
      borderStyle="round"
      borderColor="grey"
      width="100%"
      paddingLeft={1}
      paddingRight={1}
    >
      {connectionError && (
        <>
          <Text color="red">{Label.CONNECTION_ERROR}</Text>
          <Text color="gray">{connectionError}</Text>
          <MirrorFailover />
        </>
      )}
      {!connectionError && (
        <>
          <Text color="white">
            <InkSpinner type="simpleDotsScrolling" />
          </Text>
          <Text color="white">{Label.GETTING_RESULTS}</Text>
        </>
      )}
    </Box>
  );
}
