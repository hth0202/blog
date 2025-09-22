import { MainSection } from '@/components/home';
import { PostCard } from '@/components/post';

import { getPostsFromNotion } from '@/services/notion-api';

import type { Post } from '@/types/blog';

export const revalidate = 10; // 10초마다 재생성 (ISR)

async function getRecentPosts(): Promise<Post[]> {
  try {
    const notionPosts = await getPostsFromNotion();
    if (notionPosts && notionPosts.length > 0) {
      return notionPosts.filter((post) => post.status === '발행').slice(0, 3); // 최근 3개 포스트
    }
    return []; // 포스트가 없을 때 빈 배열 반환
  } catch (error) {
    console.error('포스트 데이터 가져오기 실패:', error);
    return []; // 에러 발생 시 빈 배열 반환
  }
}

export default async function HomePage() {
  const recentPosts = await getRecentPosts();

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
              {recentPosts && recentPosts.length > 0 ? (
                recentPosts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))
              ) : (
                <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                  게시글이 없습니다.
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
