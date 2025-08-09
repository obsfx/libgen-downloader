import React from "react";
import { Box, Text } from "ink";
import figures from "figures";
import { useBoundStore } from "../store";
import { APP_VERSION } from "../../index";

export function AppHeader() {
  const latestVersion = useBoundStore((state) => state.latestVersion);
  const newVersionAvailable = latestVersion && latestVersion !== APP_VERSION;
  const mirrorAdapter = useBoundStore((state) => state.mirrorAdapter);

  return (
    <>
      <Box paddingY={1} flexDirection="column">
        <Text wrap="truncate-end">
          <Text color="gray">{figures.bullet} </Text>
          <Text color="white">libgen-downloader </Text>
          <Text color="green">@{APP_VERSION}</Text>
          <Text> {figures.arrowRight} </Text>
          <Text color="gray">github.com/obsfx/libgen-downloader</Text>
        </Text>
        {mirrorAdapter?.baseURL && (
          <Box>
            <Text color="gray">
              Active mirror {figures.arrowRight} {mirrorAdapter?.baseURL}
            </Text>
          </Box>
        )}
      </Box>
      {newVersionAvailable ? (
        <Box>
          <Text>
            <Text color="gray">New version available: </Text>
            <Text color="green">
              {figures.arrowRight} @{latestVersion}
            </Text>
            <Text color="blue"> run npm i -g libgen-downloader to update</Text>
          </Text>
        </Box>
      ) : null}
    </>
  );
}
