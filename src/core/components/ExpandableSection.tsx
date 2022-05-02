import React, { useMemo, useState } from 'react';
import { Box, Text, useInput, Key, useFocus } from 'ink';

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

  const renderInfoText = useMemo(() => {
    if (!expanded) {
      return (
        <Text>
          <Text bold={true}>+ </Text>
          <Text color="yellowBright" inverse={isFocused}>
            {showText}
          </Text>
        </Text>
      );
    }

    return (
      <Text>
        <Text bold={true}>- </Text>
        <Text color="yellowBright" inverse={isFocused}>
          {hideText}
        </Text>
      </Text>
    );
  }, [expanded, showText, hideText, isFocused]);

  const renderFocusText = useMemo(() => {
    if (!isFocused) {
      return null;
    }

    return <Text> Press [ENTER] to toogle the dropwdown</Text>;
  }, [isFocused]);

  const renderContent = useMemo(() => {
    if (!expanded) {
      return null;
    }

    return children;
  }, [expanded, children]);

  return (
    <Box flexDirection="column">
      <Text wrap="truncate">
        {renderInfoText}
        {renderFocusText}
      </Text>

      <Box paddingLeft={2} flexDirection="column" width="100%">
        {renderContent}
      </Box>
    </Box>
  );
};

export default ExpandableSection;
