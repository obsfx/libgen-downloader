import React, { useEffect } from "react";

import { LayoutContextProvider, useLayoutContext } from "../contexts/LayoutContext";

export const LayoutInner: React.FC<{
  children: React.ReactNode;
  initialLayout: string;
}> = ({ children, initialLayout }) => {
  const { setActiveLayout } = useLayoutContext();

  useEffect(() => {
    setActiveLayout(initialLayout);
  }, [setActiveLayout, initialLayout]);

  return <>{children}</>;
};

export const LayoutWrapper: React.FC<{
  children: React.ReactNode;
  initialLayout: string;
}> = ({ children, initialLayout }) => {
  return (
    <LayoutContextProvider>
      <LayoutInner initialLayout={initialLayout}>{children}</LayoutInner>
    </LayoutContextProvider>
  );
};

export const Layout: React.FC<{
  children: React.ReactNode;
  layoutName: string;
}> = ({ children, layoutName }) => {
  const { activeLayout } = useLayoutContext();
  return <>{activeLayout === layoutName && children}</>;
};
