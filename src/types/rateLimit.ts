// src/types/rateLimit.ts
export interface RemainingSearches {
    single: number;
    bulk: number;
    isLimited: boolean;
  }
  
  export type SearchType = 'single' | 'bulk';