import React, { useState, useContext } from "react";

export interface ILayoutContext {
  activeLayout: string;
  setActiveLayout: (value: string) => void;
}

export const LayoutContext = React.createContext<ILayoutContext | undefined>(undefined);

export const useLayoutContext = () => {
  return useContext(LayoutContext) as ILayoutContext;
};

export const LayoutContextProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [activeLayout, setActiveLayout] = useState("");

  return (
    <LayoutContext.Provider
      value={{
        activeLayout,
        setActiveLayout,
      }}
    >
      {children}
    </LayoutContext.Provider>
  );
};
