"use client";

import { useState, useEffect } from 'react';

interface ExplanationBoxProps {
  title: string;
  description: string;
  example: string;
  isOpen?: boolean;
  locale?: string;
}

export const ExplanationBox: React.FC<ExplanationBoxProps> = ({ title, description, example, isOpen = false, locale = 'de' }) => {
  const [open, setOpen] = useState(isOpen);
  const [hasBeenOpened, setHasBeenOpened] = useState(isOpen);

  useEffect(() => {
    if (isOpen) {
      setHasBeenOpened(true);
    }
  }, [isOpen]);

  const handleToggle = () => {
    setOpen(!open);
    if (!hasBeenOpened) {
      setHasBeenOpened(true);
    }
  };

  return (
    <div className={`border rounded-lg mb-2 transition-colors ${hasBeenOpened ? 'border-green-200' : 'border-gray-200'}`}>
      <button
        className="w-full flex justify-between items-center p-4 text-left text-gray-800 font-semibold focus:outline-none"
        onClick={handleToggle}
      >
        <div className="flex items-center">
            <svg 
                className={`w-5 h-5 mr-3 transition-colors ${hasBeenOpened ? 'text-green-500' : 'text-gray-300'}`}
                fill="currentColor" 
                viewBox="0 0 20 20"
            >
                <path 
                    fillRule="evenodd" 
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" 
                    clipRule="evenodd"
                ></path>
            </svg>
            <span>{title}</span>
        </div>
        <svg
          className={`w-5 h-5 transform transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </button>
      {open && (
        <div className="p-4 pt-0 pl-12 text-gray-600">
          <p className="text-sm">{description}</p>
          <p className="mt-2 text-sm italic text-gray-500">
            <span className="font-semibold not-italic">{locale === 'en' ? 'Example:' : 'Beispiel:'}</span> {example}
          </p>
        </div>
      )}
    </div>
  );
};
