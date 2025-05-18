import React, { createContext, useState, useContext } from 'react';

const DependentContext = createContext();

export const DependentProvider = ({ children }) => {
  const [isManaging, setIsManaging] = useState(false);
  const [previousUser, setPreviousUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  const startManaging = (previousUserData, dependentUserData) => {
    setPreviousUser(previousUserData);
    setCurrentUser(dependentUserData);
    setIsManaging(true);
  };

  const stopManaging = () => {
    setIsManaging(false);
    setPreviousUser(null);
    setCurrentUser(null);
  };

  return (
    <DependentContext.Provider
      value={{
        isManaging,
        previousUser,
        currentUser,
        startManaging,
        stopManaging
      }}
    >
      {children}
    </DependentContext.Provider>
  );
};

export const useDependent = () => useContext(DependentContext);