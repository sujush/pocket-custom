'use client'

import React, { createContext, useState, useContext, ReactNode } from 'react';

type RemainingSearches = {
  single: number;
  bulk: number;
  isLimited: boolean;
};

const RemainingSearchesContext = createContext<{
  remainingSearches: RemainingSearches;
  setRemainingSearches: React.Dispatch<React.SetStateAction<RemainingSearches>>;
} | null>(null);

export const RemainingSearchesProvider = ({ children }: { children: ReactNode }) => {
  const [remainingSearches, setRemainingSearches] = useState<RemainingSearches>({
    single: 0,
    bulk: 0,
    isLimited: true,
  });

  return (
    <RemainingSearchesContext.Provider value={{ remainingSearches, setRemainingSearches }}>
      {children}
    </RemainingSearchesContext.Provider>
  );
};

export const useRemainingSearches = () => {
  const context = useContext(RemainingSearchesContext);
  if (!context) {
    throw new Error('useRemainingSearches must be used within a RemainingSearchesProvider');
  }
  return context;
};
