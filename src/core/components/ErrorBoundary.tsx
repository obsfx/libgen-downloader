import React from 'react';
import { Text } from 'ink';
import { FallbackProps, ErrorBoundary } from 'react-error-boundary';

const ErrorFallback: React.FC<FallbackProps> = ({ error, resetErrorBoundary }) => {
  return (
    <Text>
      Something went wrong:
      <Text>{error.message}</Text>
    </Text>
  );
};

const ErrorBoundaryComponent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => {
        //TODO
        // reset the state of your app so the error doesn't happen again
      }}
    >
      {children}
    </ErrorBoundary>
  );
};

export default ErrorBoundaryComponent;
