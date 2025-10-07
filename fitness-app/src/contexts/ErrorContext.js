import React, { createContext, useState, useCallback, useContext } from 'react';
import { View } from 'react-native';
import ErrorMessage from '../components/ErrorMessage';

const ErrorContext = createContext(null);

export const useError = () => useContext(ErrorContext);

export const ErrorProvider = ({ children }) => {
  const [error, setError] = useState(null);
  const [retryAction, setRetryAction] = useState(null);

  const showError = useCallback((message, onRetry = null) => {
    setError(message);
    setRetryAction(() => onRetry);

    setTimeout(() => {
        setError(null);
        setRetryAction(null);
    }, 6000);
  }, []);

  const handleRetry = () => {
    if (retryAction) {
        retryAction();
    }
    setError(null);
    setRetryAction(null);
  }

  return (
    <ErrorContext.Provider value={{ showError }}>
      <View style={{ flex: 1 }}>
        {children}
        <ErrorMessage message={error} onRetry={retryAction ? handleRetry : null} />
      </View>
    </ErrorContext.Provider>
  );
};