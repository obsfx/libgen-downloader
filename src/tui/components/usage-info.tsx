import { Box, Text } from "ink";

const UsageInfo = ({ truncate }: { truncate?: boolean }) => {
  let wrap: "truncate" | undefined;
  if (truncate) {
    wrap = "truncate";
  }

  return (
    <Box>
      <Text wrap={wrap}>
        <Text color="yellow">[UP]</Text> and <Text color="yellow">[DOWN]</Text> arrow keys to reveal
        listings, <Text color="yellow">[ENTER]</Text> to interact
      </Text>
    </Box>
  );
};

export default UsageInfo;
