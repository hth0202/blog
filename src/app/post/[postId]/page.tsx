import Link from 'next/link';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';

import { ReactionSection } from '@/components/post';

import { getPostByIdFromNotion, getNotionPage } from '@/services/notion-api';

import { ShareIcon } from '@/constants';

export const revalidate = 10;

// 포스트 데이터를 가져오는 함수
async function getPost(postId: string) {
  try {
    // postId가 Notion 페이지 ID인지 확인
    const isNotionPageId = postId.includes('-') && postId.length > 10;

    if (isNotionPageId) {
      // Notion 페이지 데이터 확인
      const recordMap = await getNotionPage(postId);
      if (!recordMap) {
        notFound();
      }
      // Notion 페이지 ID인 경우
      const post = await getPostByIdFromNotion(postId);
      if (!post) {
        notFound();
      }
      return post;
    } else {
      // 숫자 ID인 경우
      const post = await getPostByIdFromNotion(Number(postId));
      if (!post) {
        notFound();
      }
      return post;
    }
  } catch (error) {
    console.error('포스트 조회 실패:', error);
    notFound();
  }
}

interface PostDetailPageProps {
  params: {
    postId: string;
  };
}

export default async function PostDetailPage({ params }: PostDetailPageProps) {
  const { postId } = await params;
  const post = await getPost(postId);

  return (
    <>
      <article className="animate-fade-in mx-auto max-w-3xl">
        <header className="mb-8">
          <img
            src={post.thumbnailUrl}
            alt={post.title}
            className="mb-6 h-64 w-full rounded-lg bg-gray-200 object-cover dark:bg-gray-700"
          />
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {post.category}
          </div>
          <h1 className="my-2 text-4xl leading-tight font-extrabold">
            {post.title}
          </h1>
          <p className="mt-2 mb-4 text-lg text-gray-600 dark:text-gray-300">
            {post.contentPreview}
          </p>
          <div className="text-sm text-gray-400 dark:text-gray-500">
            {post.date}
          </div>
        </header>

        <div className="prose dark:prose-invert prose-img:rounded-lg mb-12 max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
          >
            {post.content}
          </ReactMarkdown>
        </div>

        <div className="mb-8 flex flex-wrap gap-2">
          {post.tags.map((tag, index) => (
            <span
              key={index}
              className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="mb-12 flex items-center justify-center gap-4">
          <button className="flex items-center gap-2 rounded-md border border-gray-300 px-6 py-2 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800">
            <ShareIcon className="h-5 w-5" />
            <span>공유하기</span>
          </button>
          <Link
            href="/blog"
            className="rounded-md bg-violet-600 px-6 py-2 text-white transition-colors hover:bg-violet-700"
          >
            목록으로
          </Link>
        </div>

        <div className="border-t border-gray-200 pt-8 dark:border-gray-700">
          <ReactionSection postId={post.id} />

          <section aria-labelledby="comments-heading">
            <h2 id="comments-heading" className="mb-4 text-xl font-bold">
              댓글 3개
            </h2>
            <div className="space-y-6">
              {/* Mock Comment */}
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                <div className="flex-grow">
                  <div className="font-semibold">사용자 1</div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    정말 유용한 글입니다! 감사합니다.
                  </p>
                  <div className="mt-1 text-xs text-gray-400">2일 전</div>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                <div className="flex-grow">
                  <div className="font-semibold">사용자 2</div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    이 부분에 대해 더 자세히 설명해주실 수 있나요?
                  </p>
                  <div className="mt-1 text-xs text-gray-400">1일 전</div>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <textarea
                rows={4}
                placeholder="댓글을 입력하세요..."
                className="w-full rounded-md border border-gray-300 bg-gray-50 p-3 text-sm transition-all focus:ring-2 focus:ring-violet-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800"
                aria-label="댓글 작성"
              />
              <div className="mt-2 flex justify-end">
                <button className="rounded-md bg-violet-600 px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-violet-700">
                  댓글 달기
                </button>
              </div>
            </div>
          </section>
        </div>
      </article>
    </>
  );
}
