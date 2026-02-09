import React from 'react';
import { twMerge } from 'tailwind-merge';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div
      className={twMerge(
        'bg-white rounded-lg border border-gray-100',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
