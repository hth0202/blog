import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="hidden bg-gray-100 md:block dark:bg-[#1a1a1a]">
      <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
          © {new Date().getFullYear() === 2026 ? '2026' : `2026–${new Date().getFullYear()}`} 태피, All Rights Reserved.
        </p>
      </div>
    </footer>
  );
};
