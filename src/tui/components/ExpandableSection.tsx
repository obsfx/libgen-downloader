import React, { useState } from "react";
import { Box, Text, useInput, Key, useFocus } from "ink";

const ExpandableSectionInfoText: React.FC<{
  expanded: boolean;
  isFocused: boolean;
  showText: string;
  hideText: string;
}> = ({ expanded, isFocused, showText, hideText }) => {
  const icon = !expanded ? "+" : "=";
  const label = !expanded ? showText : hideText;

  return (
    <Text>
      <Text bold={true}>{icon} </Text>
      <Text color="yellowBright" inverse={isFocused}>
        {label}
      </Text>
    </Text>
  );
};

const ExpandableSectionFocusText: React.FC<{ isFocused: boolean }> = ({ isFocused }) => {
  if (!isFocused) {
    return null;
  }

  return <Text> Press [ENTER] to toogle the dropwdown</Text>;
};

const ExpandableSection: React.FC<{
  children: React.ReactNode;
  showText: string;
  hideText: string;
}> = ({ children, showText, hideText }) => {
  const [expanded, setExpanded] = useState(false);
  const { isFocused } = useFocus();

  useInput((_, key: Key) => {
    if (key.return && isFocused) {
      setExpanded(!expanded);
    }
  });

  return (
    <Box flexDirection="column">
      <Text wrap="truncate">
        <ExpandableSectionInfoText
          expanded={expanded}
          isFocused={isFocused}
          showText={showText}
          hideText={hideText}
        />
        <ExpandableSectionFocusText isFocused={isFocused} />
      </Text>

      <Box paddingLeft={2} flexDirection="column" width="100%">
        {expanded ? children : null}
      </Box>
    </Box>
  );
};

export default ExpandableSection;
