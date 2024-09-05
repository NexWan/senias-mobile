import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define the context with a default value
interface WordContextType {
  word: string;
  setWord: (word: string) => void;
}

const WordContext = createContext<WordContextType | undefined>(undefined);

// Create a provider component
interface WordProviderProps {
  children: ReactNode;
}

export const WordProvider: React.FC<WordProviderProps> = ({ children }) => {
  const [word, setWord] = useState<string>('defaultWord');

  return (
    <WordContext.Provider value={{ word, setWord }}>
      {children}
    </WordContext.Provider>
  );
};

// Custom hook to use the WordContext
export const useWordContext = () => {
  const context = useContext(WordContext);
  if (context === undefined) {
    throw new Error('useWordContext must be used within a WordProvider');
  }
  return context;
};