import { useAtom } from "jotai";
import React, { useEffect } from "react";
import { activeLayoutAtom } from "../store/app";

export const LayoutInner: React.FC<{
  children: React.ReactNode;
  initialLayout: string;
}> = ({ children, initialLayout }) => {
  const [, setActiveLayout] = useAtom(activeLayoutAtom);

  useEffect(() => {
    setActiveLayout(initialLayout);
  }, [setActiveLayout, initialLayout]);

  return <>{children}</>;
};

export const LayoutWrapper: React.FC<{
  children: React.ReactNode;
  initialLayout: string;
}> = ({ children, initialLayout }) => {
  return <LayoutInner initialLayout={initialLayout}>{children}</LayoutInner>;
};

export const Layout: React.FC<{
  children: React.ReactNode;
  layoutName: string;
}> = ({ children, layoutName }) => {
  const [activeLayout] = useAtom(activeLayoutAtom);
  return <>{activeLayout === layoutName && children}</>;
};
