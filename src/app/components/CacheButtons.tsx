'use client';

import React from 'react';
import { useWizard } from '../context/WizardContext';

export function CacheButtons() {
  const wizard = useWizard();

  const handleClearApiCache = async () => {
    try {
      const response = await fetch('/api/clear-cache', {
        method: 'POST',
      });
      if (response.ok) {
        console.log('API Cache cleared successfully!');
        alert('API Cache cleared successfully!');
      } else {
        console.error('Failed to clear API cache');
        alert('Failed to clear API cache');
      }
    } catch (error) {
      console.error('Error clearing API cache:', error);
      alert('Error clearing API cache');
    }
  };

  return (
    <div className="flex space-x-2 p-2 justify-end">
      <button
        onClick={() => wizard.reset()}
        className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
      >
        Sitzungsdaten löschen
      </button>
      <button
        onClick={handleClearApiCache}
        className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-50"
      >
        Delete API Cache
      </button>
    </div>
  );
}
