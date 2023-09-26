import React from "react";
import { Box, Text } from "ink";
import { APP_VERSION } from "../../app-version.js";
import figures from "figures";
import { useBoundStore } from "../store/index.js";

export function AppHeader() {
  const latestVersion = useBoundStore((state) => state.latestVersion);
  const newVersionAvailable = latestVersion && latestVersion !== APP_VERSION;

  return (
    <>
      <Box borderColor="gray" borderStyle="round" paddingX={1} width={65} flexDirection="column">
        <Box>
          <Text>
            <Text color="white">libgen-downloader </Text>
            <Text color="green">@{APP_VERSION}</Text>
            <Text> {figures.arrowRight} </Text>
            <Text color="gray">github.com/obsfx/libgen-downloader</Text>
          </Text>
        </Box>
      </Box>
      {newVersionAvailable && (
        <Box>
          <Text>
            <Text color="gray">New version available: </Text>
            <Text color="green">
              {figures.arrowRight} @{latestVersion}
            </Text>
            <Text color="blue"> run npm i -g libgen-downloader to update</Text>
          </Text>
        </Box>
      )}
    </>
  );
}
