import type { Comment } from '@/types/blog';

// Notion API로 페이지에 다는 댓글은 페이지마다 스레드가 하나뿐이라, 방문자 댓글과
// 블로그 주인이 노션에서 단 댓글이 한 줄로 이어진다. 그래서 주인 댓글이 어느 방문자
// 댓글에 대한 답인지는 아래 규칙으로 정한다.
// - 기본: 바로 앞의 방문자 댓글에 대한 답글
// - "@이름"으로 시작: 그 이름의 가장 최근 방문자 댓글에 대한 답글
export interface RawComment {
  id: string;
  text: string;
  createdAt: string;
  // null이면 블로그 주인이 노션에서 직접 쓴 댓글
  author: string | null;
}

export const OWNER_NAME = '한태희';

const findReplyTarget = (comments: Comment[], text: string) => {
  const visitors = comments.filter((c) => !c.isOwner);
  if (text.startsWith('@')) {
    // 이름이 서로 겹치면("룰루", "룰루랄라") 더 긴 이름을, 같은 이름이면 최근 댓글을 고른다
    const target = visitors
      .filter((c) => text.startsWith(c.author, 1))
      .reverse()
      .sort((a, b) => b.author.length - a.author.length)[0];
    if (target) {
      // "@룰루랄라님, 감사해요" → "감사해요"
      const content = text
        .slice(1 + target.author.length)
        .replace(/^님?[,:]?\s*/, '')
        .trim();
      return { target, content };
    }
  }
  return { target: visitors.at(-1), content: text };
};

export const buildCommentThreads = (raws: RawComment[]): Comment[] => {
  const comments: Comment[] = [];

  for (const raw of raws) {
    const base = {
      id: raw.id,
      content: raw.text.trim(),
      createdAt: raw.createdAt,
      replies: [],
    };

    if (raw.author !== null) {
      comments.push({ ...base, author: raw.author, isOwner: false });
      continue;
    }

    const { target, content } = findReplyTarget(comments, base.content);
    if (!content) continue;
    if (!target) {
      comments.push({ ...base, author: OWNER_NAME, isOwner: true });
    } else {
      target.replies.push({ id: raw.id, content, createdAt: raw.createdAt });
    }
  }

  return comments;
};
