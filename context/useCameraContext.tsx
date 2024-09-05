import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define the shape of the context
interface CameraIsActiveContextType {
  isActive: boolean;
  setActive: (active: boolean) => void;
}

// Create the context with a default value
const CameraIsActiveContext = createContext<CameraIsActiveContextType | undefined>(undefined);

// Create a provider component
export const CameraIsActiveProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isActive, setIsActive] = useState<boolean>(false);

  const setActive = (active: boolean) => {
    setIsActive(active);
  };

  return (
    <CameraIsActiveContext.Provider value={{ isActive, setActive }}>
      {children}
    </CameraIsActiveContext.Provider>
  );
};

// Create a custom hook to use the context
export const useCameraIsActive = (): CameraIsActiveContextType => {
  const context = useContext(CameraIsActiveContext);
  if (context === undefined) {
    throw new Error('useCameraIsActive must be used within a CameraIsActiveProvider');
  }
  return context;
};