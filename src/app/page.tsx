import React from 'react';

import { MainSection } from '@/components/home';
import { PostCardSkeleton } from '@/components/PostCard';

export default function HomePage() {
  return (
    <div className="-mt-16">
      <MainSection />
      {/* Main Content Section */}
      <div
        id="main-content"
        className="relative z-10 bg-white dark:bg-gray-900"
      >
        <div className="mx-auto max-w-4xl px-4 pt-16 sm:px-6 lg:px-8">
          <section>
            <h2 className="mb-6 border-b border-gray-200 pb-2 text-2xl font-bold dark:border-gray-700">
              최근 게시한 글
            </h2>
            <div className="space-y-8">
              {Array.from({ length: 3 }).map((_, index) => (
                <PostCardSkeleton key={index} />
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
