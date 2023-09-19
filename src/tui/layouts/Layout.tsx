import React, { useEffect } from "react";
import { useBoundStore } from "../store/index.js";
import { LAYOUT_KEY } from "./keys.js";

export const LayoutInner: React.FC<{
  children: React.ReactNode;
  initialLayout: LAYOUT_KEY;
}> = ({ children, initialLayout }) => {
  const setActiveLayout = useBoundStore((state) => state.setActiveLayout);

  useEffect(() => {
    setActiveLayout(initialLayout);
  }, [setActiveLayout, initialLayout]);

  return <>{children}</>;
};

export const LayoutWrapper: React.FC<{
  children: React.ReactNode;
  initialLayout: LAYOUT_KEY;
}> = ({ children, initialLayout }) => {
  return <LayoutInner initialLayout={initialLayout}>{children}</LayoutInner>;
};

export const Layout: React.FC<{
  children: React.ReactNode;
  layoutName: string;
}> = ({ children, layoutName }) => {
  const activeLayout = useBoundStore((state) => state.activeLayout);
  return <>{activeLayout === layoutName && children}</>;
};
