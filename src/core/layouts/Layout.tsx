import React, { useContext, useEffect } from 'react';

import { ILayoutContext, LayoutContext, LayoutContextProvider } from '../LayoutContext';

export const LayoutInner: React.FC<{
  children: React.ReactNode;
  initialLayout: string;
}> = ({ children, initialLayout }) => {
  const { setActiveLayout } = useContext(LayoutContext) as ILayoutContext;

  useEffect(() => {
    setActiveLayout(initialLayout);
  }, []);

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
  const { activeLayout } = useContext(LayoutContext) as ILayoutContext;
  return <>{activeLayout === layoutName && children}</>;
};
