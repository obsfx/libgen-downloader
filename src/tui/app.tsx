import { useEffect } from "react";
import { Text, useStdin } from "ink";

import Layouts from "./layouts/index";
import { DownloadIndicator } from "./components/download-indicator";
import { ErrorMessage } from "./components/error-message";
import { useBoundStore } from "./store";
import { AppHeader } from "./components/app-header";
import { AppContainer } from "./components/app-container";

interface Properties {
  doNotFetchConfigInitially: boolean;
}

export function App({ doNotFetchConfigInitially }: Properties) {
  const { setRawMode } = useStdin();

  const errorMessage = useBoundStore((state) => state.errorMessage);
  const warningMessage = useBoundStore((state) => state.warningMessage);
  const fetchConfig = useBoundStore((state) => state.fetchConfig);

  useEffect(() => {
    if (doNotFetchConfigInitially) {
      return;
    }

    fetchConfig();
  }, [doNotFetchConfigInitially, fetchConfig]);

  useEffect(() => {
    setRawMode(true);
    return () => {
      setRawMode(false);
    };
  }, [setRawMode]);

  if (errorMessage) {
    return <ErrorMessage />;
  }

  return (
    <AppContainer>
      <AppHeader />
      <Layouts />
      <DownloadIndicator />
      {warningMessage && <Text color="yellow">[!] {warningMessage}</Text>}
    </AppContainer>
  );
}

export default App;
