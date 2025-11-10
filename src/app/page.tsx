"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/step/1');
  }, [router]);

  return (
    <div className="w-full h-full flex items-center justify-center">
      <p>Leite weiter zum Wizard...</p>
    </div>
  );
}
