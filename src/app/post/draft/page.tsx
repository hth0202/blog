import { PostContent } from '@/components/post';

import { getPostsFromNotion } from '@/services/notion-api';

import { Post, Category } from '@/types/blog';

export const dynamic = 'force-dynamic';
export const revalidate = 10; // 10초마다 재생성 (ISR)

async function getPosts(): Promise<{
  posts: Post[];
  categories: Category[];
}> {
  try {
    const notionPosts = await getPostsFromNotion();

    // 카테고리 추출
    const categorySet = new Set<string>();
    notionPosts.forEach((post) => {
      if (post.category) {
        categorySet.add(post.category);
      }
    });

    const categories: Category[] = [
      { id: 'all', name: '전체보기' },
      ...Array.from(categorySet).map((name, index) => ({
        id: `category-${index}`,
        name,
      })),
    ];

    return { posts: notionPosts, categories };
  } catch (error) {
    console.error('블로그 데이터 가져오기 실패:', error);
    return { posts: [], categories: [{ id: 'all', name: '전체보기' }] };
  }
}

export default async function PostDraftPage() {
  const { posts, categories } = await getPosts();

  return <PostContent initialPosts={posts} initialCategories={categories} />;
}
