"use client";

import { useState } from 'react';

interface ExplanationBoxProps {
  title: string;
  content: string;
  isOpen?: boolean;
}

export const ExplanationBox: React.FC<ExplanationBoxProps> = ({ title, content, isOpen = false }) => {
  const [open, setOpen] = useState(isOpen);

  // Split content into lines for rendering bullet points
  const contentLines = content.split('\n');

  return (
    <div className="border border-gray-200 rounded-lg mb-2">
      <button
        className="w-full flex justify-between items-center p-4 text-left text-gray-800 font-semibold focus:outline-none"
        onClick={() => setOpen(!open)}
      >
        <span>{title}</span>
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
        <div className="p-4 pt-0 text-gray-600">
          {contentLines.map((line, index) => {
            if (line.trim().startsWith('*')) {
              return (
                <p key={index} className="ml-4 text-sm italic text-gray-500">
                  {line.replace('*', '•').trim()}
                </p>
              );
            }
            return <p key={index} className="text-sm">{line}</p>;
          })}
        </div>
      )}
    </div>
  );
};
