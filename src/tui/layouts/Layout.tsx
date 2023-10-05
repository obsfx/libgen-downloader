import React from "react";
import { useBoundStore } from "../store/index";

export const Layout: React.FC<{
  children: React.ReactNode;
  layoutName: string;
}> = ({ children, layoutName }) => {
  const activeLayout = useBoundStore((state) => state.activeLayout);
  return <>{activeLayout === layoutName && children}</>;
};
