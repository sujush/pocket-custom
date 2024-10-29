// src/components/ui/radio-group.tsx
import * as React from 'react';

export const RadioGroup = ({ children, onValueChange }: { children: React.ReactNode, onValueChange: (value: string) => void }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onValueChange(e.target.value);
  };

  return <div onChange={handleChange}>{children}</div>;
};

export const RadioGroupItem = ({ value, label }: { value: string, label: string }) => (
  <label>
    <input type="radio" name="radio-group" value={value} />
    {label}
  </label>
);
