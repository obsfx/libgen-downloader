import React, { useEffect } from "react";
import { useStdin } from "ink";

import Layouts from "./layouts";

const App: React.FC = () => {
  const { setRawMode } = useStdin();

  useEffect(() => {
    setRawMode(true);
    return () => {
      setRawMode(false);
    };
  }, [setRawMode]);

  return <Layouts />;
};

export default App;
