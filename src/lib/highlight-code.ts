import {
  getSingletonHighlighter,
  type BundledLanguage,
  type Highlighter,
} from 'shiki';

// Notion 언어 ID 중 shiki 번들 ID와 이름이 다른 것들만 매핑
// (c++, c#, f#, shell, docker, objective-c, vb 등은 shiki가 이미 동일한 ID로 지원)
const LANGUAGE_ALIASES: Record<string, string> = {
  'plain text': 'text',
  markup: 'html',
  flow: 'javascript',
  livescript: 'coffee',
  reason: 'ocaml',
  'visual basic': 'vb',
  'notion formula': 'text',
  'wolfram language': 'text',
  'java/c/c++/c#': 'java',
};

let highlighterPromise: Promise<Highlighter> | null = null;

function getHighlighter() {
  highlighterPromise ??= getSingletonHighlighter({
    themes: ['github-light', 'github-dark'],
    langs: [],
  });
  return highlighterPromise;
}

/**
 * Notion 코드 블록을 shiki로 문법 강조된 HTML(<pre><code>...)로 변환한다.
 * 라이트/다크 테마를 모두 CSS 변수로 내보내고, .dark 클래스로 전환한다
 * (globals.css의 .shiki 규칙과 짝을 이룸).
 */
export async function highlightCode(
  code: string,
  notionLanguage: string,
  roundedClass: 'rounded-lg' | 'rounded-b-lg',
): Promise<string> {
  const highlighter = await getHighlighter();
  const normalized = notionLanguage?.toLowerCase().trim() || 'plain text';
  let lang = LANGUAGE_ALIASES[normalized] ?? normalized;

  if (lang !== 'text' && !highlighter.getLoadedLanguages().includes(lang)) {
    try {
      await highlighter.loadLanguage(lang as BundledLanguage);
    } catch {
      lang = 'text';
    }
  }

  return highlighter.codeToHtml(code, {
    lang,
    themes: { light: 'github-light', dark: 'github-dark' },
    defaultColor: false,
    transformers: [
      {
        pre(node) {
          this.addClassToHast(
            node,
            `overflow-x-auto p-4 text-sm ${roundedClass}`,
          );
        },
      },
    ],
  });
}
