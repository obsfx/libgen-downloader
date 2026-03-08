import type { FC, ReactNode } from "react";
import { useBoundStore } from "../store/index";

export const Layout: FC<{
  children: ReactNode;
  layoutName: string;
}> = ({ children, layoutName }) => {
  const activeLayout = useBoundStore((state) => state.activeLayout);
  return <>{activeLayout === layoutName && children}</>;
};
